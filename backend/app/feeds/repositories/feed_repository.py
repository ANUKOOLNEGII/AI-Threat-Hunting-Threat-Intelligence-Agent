from __future__ import annotations

import uuid
from datetime import datetime, timedelta
from typing import Any, Optional

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.feeds.models import APIUsageStatistic, ConnectorStatus, FeedLog, FeedSyncHistory, ThreatFeed
from app.feeds.schemas.feed import FeedCreate, FeedUpdate


class FeedRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def list(self, *, query: Optional[str], enabled: Optional[bool], status: Optional[str], page: int, page_size: int) -> tuple[list[ThreatFeed], int]:
        stmt = select(ThreatFeed)
        if query:
            like = f"%{query.lower()}%"
            stmt = stmt.where(or_(func.lower(ThreatFeed.name).like(like), func.lower(ThreatFeed.provider).like(like), func.lower(ThreatFeed.feed_type).like(like)))
        if enabled is not None:
            stmt = stmt.where(ThreatFeed.enabled.is_(enabled))
        if status and status != "all":
            stmt = stmt.where(ThreatFeed.status == status)
        total = int((await self.session.execute(select(func.count()).select_from(stmt.subquery()))).scalar_one())
        stmt = stmt.order_by(ThreatFeed.updated_at.desc()).offset((page - 1) * page_size).limit(page_size)
        return list((await self.session.execute(stmt)).scalars().all()), total

    async def get(self, feed_id: str) -> Optional[ThreatFeed]:
        return (await self.session.execute(select(ThreatFeed).where(ThreatFeed.id == feed_id))).scalar_one_or_none()

    async def get_enabled(self) -> list[ThreatFeed]:
        return list((await self.session.execute(select(ThreatFeed).where(ThreatFeed.enabled.is_(True)).order_by(ThreatFeed.name))).scalars().all())

    async def create(self, payload: FeedCreate) -> ThreatFeed:
        now = datetime.utcnow()
        feed = ThreatFeed(
            id=payload.id or f"feed-{uuid.uuid4().hex[:12]}",
            name=payload.name,
            provider=payload.provider,
            feed_type=payload.feedType,
            url=payload.url,
            enabled=payload.enabled,
            status="idle",
            health_status="unknown",
            auth_type=payload.authType,
            api_key_env=payload.apiKeyEnv,
            schedule=payload.schedule,
            interval_seconds=payload.intervalSeconds,
            timeout_seconds=payload.timeoutSeconds,
            retry_count=payload.retryCount,
            rate_limit_per_minute=payload.rateLimitPerMinute,
            next_sync_at=now + timedelta(seconds=payload.intervalSeconds),
            metadata_=payload.metadata,
        )
        self.session.add(feed)
        await self.session.commit()
        await self.session.refresh(feed)
        return feed

    async def update(self, feed: ThreatFeed, payload: FeedUpdate) -> ThreatFeed:
        mapping = {
            "feedType": "feed_type",
            "authType": "auth_type",
            "apiKeyEnv": "api_key_env",
            "intervalSeconds": "interval_seconds",
            "timeoutSeconds": "timeout_seconds",
            "retryCount": "retry_count",
            "rateLimitPerMinute": "rate_limit_per_minute",
            "metadata": "metadata_",
        }
        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(feed, mapping.get(key, key), value)
        feed.updated_at = datetime.utcnow()
        if payload.intervalSeconds is not None:
            feed.next_sync_at = feed.updated_at + timedelta(seconds=payload.intervalSeconds)
        await self.session.commit()
        await self.session.refresh(feed)
        return feed

    async def delete(self, feed: ThreatFeed) -> None:
        await self.session.delete(feed)
        await self.session.commit()

    async def set_sync_state(self, feed: ThreatFeed, *, status: str, health_status: Optional[str] = None, processed_delta: int = 0, success_rate: Optional[float] = None) -> ThreatFeed:
        now = datetime.utcnow()
        feed.status = status
        if health_status:
            feed.health_status = health_status
        feed.last_sync_at = now if status in {"synchronized", "failed"} else feed.last_sync_at
        feed.next_sync_at = now + timedelta(seconds=feed.interval_seconds)
        feed.records_processed += processed_delta
        if success_rate is not None:
            feed.success_rate = success_rate
        feed.updated_at = now
        await self.session.commit()
        await self.session.refresh(feed)
        return feed

    async def create_history(self, *, feed_id: str, status: str, records_received: int = 0, records_created: int = 0, records_updated: int = 0, records_rejected: int = 0, error_message: Optional[str] = None, metadata: Optional[dict[str, Any]] = None) -> FeedSyncHistory:
        history = FeedSyncHistory(
            id=f"sync-{uuid.uuid4().hex[:12]}",
            feed_id=feed_id,
            status=status,
            finished_at=datetime.utcnow(),
            records_received=records_received,
            records_created=records_created,
            records_updated=records_updated,
            records_rejected=records_rejected,
            error_message=error_message,
            metadata_=metadata or {},
        )
        self.session.add(history)
        await self.session.commit()
        await self.session.refresh(history)
        return history

    async def history(self, *, feed_id: Optional[str], page: int, page_size: int) -> tuple[list[FeedSyncHistory], int]:
        stmt = select(FeedSyncHistory)
        if feed_id:
            stmt = stmt.where(FeedSyncHistory.feed_id == feed_id)
        total = int((await self.session.execute(select(func.count()).select_from(stmt.subquery()))).scalar_one())
        stmt = stmt.order_by(FeedSyncHistory.started_at.desc()).offset((page - 1) * page_size).limit(page_size)
        return list((await self.session.execute(stmt)).scalars().all()), total

    async def log(self, *, feed_id: Optional[str], level: str, event_type: str, message: str, metadata: Optional[dict[str, Any]] = None) -> FeedLog:
        entry = FeedLog(id=f"log-{uuid.uuid4().hex[:12]}", feed_id=feed_id, level=level, event_type=event_type, message=message, metadata_=metadata or {})
        self.session.add(entry)
        await self.session.commit()
        await self.session.refresh(entry)
        return entry

    async def logs(self, *, feed_id: Optional[str], page: int, page_size: int) -> tuple[list[FeedLog], int]:
        stmt = select(FeedLog)
        if feed_id:
            stmt = stmt.where(FeedLog.feed_id == feed_id)
        total = int((await self.session.execute(select(func.count()).select_from(stmt.subquery()))).scalar_one())
        stmt = stmt.order_by(FeedLog.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        return list((await self.session.execute(stmt)).scalars().all()), total

    async def connector_status(self, connector_type: str) -> Optional[ConnectorStatus]:
        return (await self.session.execute(select(ConnectorStatus).where(ConnectorStatus.connector_type == connector_type))).scalar_one_or_none()

    async def upsert_connector_status(self, *, connector_type: str, status: str, message: Optional[str], failures: int = 0, circuit_open_until: Optional[datetime] = None, metadata: Optional[dict[str, Any]] = None) -> ConnectorStatus:
        row = await self.connector_status(connector_type)
        if not row:
            row = ConnectorStatus(connector_type=connector_type)
            self.session.add(row)
        row.status = status
        row.message = message
        row.consecutive_failures = failures
        row.circuit_open_until = circuit_open_until
        row.last_checked_at = datetime.utcnow()
        row.metadata_ = metadata or row.metadata_ or {}
        await self.session.commit()
        await self.session.refresh(row)
        return row

    async def usage(self, *, connector_type: str, records_received: int, errors: int) -> APIUsageStatistic:
        row = APIUsageStatistic(id=f"usage-{uuid.uuid4().hex[:12]}", connector_type=connector_type, requests_made=1, records_received=records_received, errors=errors)
        self.session.add(row)
        await self.session.commit()
        await self.session.refresh(row)
        return row
