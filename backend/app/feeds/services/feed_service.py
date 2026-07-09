from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any, Optional

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.repositories.user_repository import UserRepository
from app.core.config import get_settings
from app.feeds.cache.feed_cache import feed_cache
from app.feeds.connectors import CONNECTOR_REGISTRY, ConnectorConfig, ConnectorError
from app.feeds.models import FeedLog, FeedSyncHistory, ThreatFeed
from app.feeds.repositories.feed_repository import FeedRepository
from app.feeds.schemas.feed import FeedCreate, FeedUpdate
from app.feeds.services.normalization_service import NormalizationService
from app.threat_intel.cache.dashboard_cache import dashboard_cache


class FeedService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repository = FeedRepository(session)
        self.normalizer = NormalizationService(session)
        self.audit = UserRepository(session)
        self.settings = get_settings()

    def serialize_feed(self, feed: ThreatFeed) -> dict[str, Any]:
        return {
            "id": feed.id,
            "name": feed.name,
            "provider": feed.provider,
            "feedType": feed.feed_type,
            "url": feed.url,
            "enabled": feed.enabled,
            "status": feed.status,
            "healthStatus": feed.health_status,
            "authType": feed.auth_type,
            "apiKeyEnv": feed.api_key_env,
            "schedule": feed.schedule,
            "intervalSeconds": feed.interval_seconds,
            "timeoutSeconds": feed.timeout_seconds,
            "retryCount": feed.retry_count,
            "rateLimitPerMinute": feed.rate_limit_per_minute,
            "lastSync": feed.last_sync_at.isoformat() if feed.last_sync_at else None,
            "nextSync": feed.next_sync_at.isoformat() if feed.next_sync_at else None,
            "recordsProcessed": feed.records_processed,
            "successRate": feed.success_rate,
            "metadata": feed.metadata_ or {},
            "createdAt": feed.created_at.isoformat(),
            "updatedAt": feed.updated_at.isoformat(),
        }

    def serialize_history(self, item: FeedSyncHistory) -> dict[str, Any]:
        return {
            "id": item.id,
            "feedId": item.feed_id,
            "status": item.status,
            "startedAt": item.started_at.isoformat(),
            "finishedAt": item.finished_at.isoformat() if item.finished_at else None,
            "recordsReceived": item.records_received,
            "recordsCreated": item.records_created,
            "recordsUpdated": item.records_updated,
            "recordsRejected": item.records_rejected,
            "errorMessage": item.error_message,
            "metadata": item.metadata_ or {},
        }

    def serialize_log(self, item: FeedLog) -> dict[str, Any]:
        return {
            "id": item.id,
            "feedId": item.feed_id,
            "level": item.level,
            "message": item.message,
            "eventType": item.event_type,
            "createdAt": item.created_at.isoformat(),
            "metadata": item.metadata_ or {},
        }

    def connector_config(self, feed: ThreatFeed) -> ConnectorConfig:
        return ConnectorConfig(
            feed_id=feed.id,
            feed_type=feed.feed_type,
            name=feed.name,
            provider=feed.provider,
            url=feed.url,
            auth_type=feed.auth_type,
            api_key_env=feed.api_key_env,
            timeout_seconds=feed.timeout_seconds,
            retry_count=feed.retry_count,
            rate_limit_per_minute=feed.rate_limit_per_minute,
            metadata=feed.metadata_ or {},
        )

    async def list(self, *, query: Optional[str], enabled: Optional[bool], status_filter: Optional[str], page: int, page_size: int) -> dict[str, Any]:
        cached = await feed_cache.get(f"list:{query}:{enabled}:{status_filter}:{page}:{page_size}")
        if cached:
            return cached
        items, total = await self.repository.list(query=query, enabled=enabled, status=status_filter, page=page, page_size=page_size)
        payload = {"items": [self.serialize_feed(item) for item in items], "total": total, "page": page, "pageSize": page_size}
        await feed_cache.set(f"list:{query}:{enabled}:{status_filter}:{page}:{page_size}", payload)
        return payload

    async def get(self, feed_id: str) -> dict[str, Any]:
        feed = await self.repository.get(feed_id)
        if not feed:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feed not found")
        return self.serialize_feed(feed)

    async def create(self, payload: FeedCreate, user_id: Optional[str]) -> dict[str, Any]:
        if payload.feedType not in CONNECTOR_REGISTRY:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported feed type")
        feed = await self.repository.create(payload)
        await self.repository.log(feed_id=feed.id, level="info", event_type="feed.create", message="Feed registered")
        if user_id:
            await self.audit.create_audit_log(user_id, "feed.create", feed.id)
        await feed_cache.clear()
        return self.serialize_feed(feed)

    async def update(self, feed_id: str, payload: FeedUpdate, user_id: Optional[str]) -> dict[str, Any]:
        feed = await self.repository.get(feed_id)
        if not feed:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feed not found")
        if payload.feedType and payload.feedType not in CONNECTOR_REGISTRY:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported feed type")
        feed = await self.repository.update(feed, payload)
        await self.repository.log(feed_id=feed.id, level="info", event_type="feed.update", message="Feed updated")
        if user_id:
            await self.audit.create_audit_log(user_id, "feed.update", feed.id)
        await feed_cache.clear()
        return self.serialize_feed(feed)

    async def delete(self, feed_id: str, user_id: Optional[str]) -> None:
        feed = await self.repository.get(feed_id)
        if not feed:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feed not found")
        await self.repository.log(feed_id=feed.id, level="warning", event_type="feed.delete", message="Feed deleted")
        await self.repository.delete(feed)
        if user_id:
            await self.audit.create_audit_log(user_id, "feed.delete", feed_id)
        await feed_cache.clear()

    async def sync_all(self, *, use_network: bool = False) -> dict[str, Any]:
        feeds = await self.repository.get_enabled()
        results = []
        for feed in feeds:
            results.append(await self.sync(feed.id, use_network=use_network))
        return {"items": results, "total": len(results)}

    async def sync(self, feed_id: str, *, use_network: bool = False) -> dict[str, Any]:
        feed = await self.repository.get(feed_id)
        if not feed:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feed not found")
        if not feed.enabled:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Feed is disabled")

        connector_cls = CONNECTOR_REGISTRY.get(feed.feed_type)
        if not connector_cls:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported feed type")

        connector_state = await self.repository.connector_status(feed.feed_type)
        now = datetime.utcnow()
        if connector_state and connector_state.circuit_open_until and connector_state.circuit_open_until > now:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Connector circuit breaker is open")

        connector = connector_cls(self.connector_config(feed))
        await self.repository.set_sync_state(feed, status="syncing", health_status="checking")
        await self.repository.log(feed_id=feed.id, level="info", event_type="feed.sync.start", message="Feed synchronization started")
        try:
            result = await connector.fetch(use_network=use_network)
            normalized = await self.normalizer.ingest_records(result.records, feed_id=feed.id, provider=feed.provider)
            success_rate = 100.0 if normalized.received == 0 else round(((normalized.received - normalized.rejected) / normalized.received) * 100, 2)
            await self.repository.set_sync_state(feed, status="synchronized", health_status="healthy", processed_delta=normalized.created + normalized.updated, success_rate=success_rate)
            await self.repository.create_history(
                feed_id=feed.id,
                status="success",
                records_received=normalized.received,
                records_created=normalized.created,
                records_updated=normalized.updated,
                records_rejected=normalized.rejected,
                metadata={"connector": feed.feed_type, "errors": normalized.errors},
            )
            await self.repository.upsert_connector_status(connector_type=feed.feed_type, status="healthy", message="Synchronization successful", failures=0, metadata=result.metadata)
            await self.repository.usage(connector_type=feed.feed_type, records_received=normalized.received, errors=normalized.rejected)
            await self.repository.log(feed_id=feed.id, level="info", event_type="feed.sync.success", message="Feed synchronization completed", metadata={"created": normalized.created, "updated": normalized.updated, "rejected": normalized.rejected})
            await feed_cache.clear()
            await dashboard_cache.clear()
            return {"feedId": feed.id, "status": "success", "received": normalized.received, "created": normalized.created, "updated": normalized.updated, "rejected": normalized.rejected, "errors": normalized.errors}
        except ConnectorError as exc:
            failures = (connector_state.consecutive_failures if connector_state else 0) + 1
            circuit_open_until = None
            if failures >= self.settings.feed_circuit_breaker_failure_threshold:
                circuit_open_until = datetime.utcnow() + timedelta(seconds=self.settings.feed_circuit_breaker_reset_seconds)
            await self.repository.set_sync_state(feed, status="failed", health_status="unhealthy", success_rate=0)
            await self.repository.create_history(feed_id=feed.id, status="failed", error_message=str(exc))
            await self.repository.upsert_connector_status(connector_type=feed.feed_type, status="unhealthy", message=str(exc), failures=failures, circuit_open_until=circuit_open_until)
            await self.repository.usage(connector_type=feed.feed_type, records_received=0, errors=1)
            await self.repository.log(feed_id=feed.id, level="error", event_type="feed.sync.failed", message=str(exc))
            await feed_cache.clear()
            return {"feedId": feed.id, "status": "failed", "received": 0, "created": 0, "updated": 0, "rejected": 1, "errors": [str(exc)]}

    async def status(self) -> dict[str, Any]:
        feeds, total = await self.repository.list(query=None, enabled=None, status=None, page=1, page_size=500)
        return {"items": [self.serialize_feed(feed) for feed in feeds], "total": total}

    async def health(self) -> dict[str, Any]:
        feeds, _ = await self.repository.list(query=None, enabled=None, status=None, page=1, page_size=500)
        return {
            "items": [{"feedId": feed.id, "name": feed.name, "feedType": feed.feed_type, "status": feed.health_status, "enabled": feed.enabled, "lastSync": feed.last_sync_at.isoformat() if feed.last_sync_at else None} for feed in feeds],
            "cache": "redis" if self.settings.redis_url else "memory-fallback",
        }

    async def history(self, *, feed_id: Optional[str], page: int, page_size: int) -> dict[str, Any]:
        items, total = await self.repository.history(feed_id=feed_id, page=page, page_size=page_size)
        return {"items": [self.serialize_history(item) for item in items], "total": total, "page": page, "pageSize": page_size}

    async def logs(self, *, feed_id: Optional[str], page: int, page_size: int) -> dict[str, Any]:
        items, total = await self.repository.logs(feed_id=feed_id, page=page, page_size=page_size)
        return {"items": [self.serialize_log(item) for item in items], "total": total, "page": page, "pageSize": page_size}

    async def statistics(self) -> dict[str, Any]:
        feeds, total = await self.repository.list(query=None, enabled=None, status=None, page=1, page_size=500)
        enabled = sum(1 for feed in feeds if feed.enabled)
        processed = sum(feed.records_processed for feed in feeds)
        avg_success = round(sum(feed.success_rate for feed in feeds) / len(feeds), 2) if feeds else 0
        return {"totalFeeds": total, "enabledFeeds": enabled, "disabledFeeds": total - enabled, "recordsProcessed": processed, "averageSuccessRate": avg_success}
