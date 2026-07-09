from __future__ import annotations

from celery import Celery

from app.core.config import get_settings

settings = get_settings()

celery_app = Celery(
    "ai_threat_hunting_agent",
    broker=settings.celery_broker_url or "memory://",
    backend=settings.celery_result_backend or "cache+memory://",
    include=["app.workers.tasks"],
)

celery_app.conf.update(
    task_track_started=True,
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
    task_default_queue="threat-intel",
    task_routes={
        "app.workers.tasks.sync_feed_task": {"queue": "feed-sync"},
        "app.workers.tasks.sync_all_feeds_task": {"queue": "feed-sync"},
        "app.workers.tasks.refresh_cves_task": {"queue": "cve-updates"},
        "app.workers.tasks.refresh_iocs_task": {"queue": "ioc-updates"},
        "app.workers.tasks.normalize_metadata_task": {"queue": "normalization"},
        "app.workers.tasks.cleanup_cache_task": {"queue": "maintenance"},
    },
)

# Import task definitions after app construction so local health checks and tests
# can verify registration without starting a worker process.
import app.workers.tasks  # noqa: E402,F401
