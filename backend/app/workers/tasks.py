from __future__ import annotations

import asyncio
from typing import Any, Optional

from app.database.session import SessionLocal, init_db
from app.feeds.cache.feed_cache import feed_cache
from app.feeds.services.feed_service import FeedService
from app.threat_intel.cache.dashboard_cache import dashboard_cache
from app.workers.celery_app import celery_app


async def _sync_feed(feed_id: str) -> dict[str, Any]:
    await init_db()
    async with SessionLocal() as session:
        return await FeedService(session).sync(feed_id)


async def _sync_all() -> dict[str, Any]:
    await init_db()
    async with SessionLocal() as session:
        return await FeedService(session).sync_all()


@celery_app.task(bind=True, autoretry_for=(Exception,), retry_backoff=True, retry_kwargs={"max_retries": 3})
def sync_feed_task(self, feed_id: str) -> dict[str, Any]:
    return asyncio.run(_sync_feed(feed_id))


@celery_app.task(bind=True, autoretry_for=(Exception,), retry_backoff=True, retry_kwargs={"max_retries": 3})
def sync_all_feeds_task(self) -> dict[str, Any]:
    return asyncio.run(_sync_all())


@celery_app.task(bind=True, autoretry_for=(Exception,), retry_backoff=True, retry_kwargs={"max_retries": 3})
def refresh_cves_task(self) -> dict[str, Any]:
    return asyncio.run(_sync_all())


@celery_app.task(bind=True, autoretry_for=(Exception,), retry_backoff=True, retry_kwargs={"max_retries": 3})
def refresh_iocs_task(self) -> dict[str, Any]:
    return asyncio.run(_sync_all())


@celery_app.task(bind=True, autoretry_for=(Exception,), retry_backoff=True, retry_kwargs={"max_retries": 3})
def normalize_metadata_task(self, feed_id: Optional[str] = None) -> dict[str, Any]:
    if feed_id:
        return asyncio.run(_sync_feed(feed_id))
    return asyncio.run(_sync_all())


@celery_app.task(bind=True)
def retry_failed_jobs_task(self) -> dict[str, Any]:
    return asyncio.run(_sync_all())


@celery_app.task(bind=True)
def cleanup_cache_task(self) -> dict[str, bool]:
    async def clear() -> dict[str, bool]:
        await feed_cache.clear()
        await dashboard_cache.clear()
        return {"cleared": True}

    return asyncio.run(clear())


@celery_app.task(bind=True)
def worker_health_task(self) -> dict[str, str]:
    return {"status": "healthy", "worker": "threat-intel"}
