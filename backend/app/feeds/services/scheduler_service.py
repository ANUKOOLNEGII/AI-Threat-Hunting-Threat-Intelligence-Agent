from __future__ import annotations

from typing import Any, Optional

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.feeds.cache.feed_cache import feed_cache
from app.feeds.models import SchedulerJob, SchedulerRunHistory
from app.feeds.repositories.scheduler_repository import SchedulerRepository
from app.feeds.services.feed_service import FeedService
from app.threat_intel.cache.dashboard_cache import dashboard_cache


class SchedulerService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repository = SchedulerRepository(session)
        self.feeds = FeedService(session)

    def serialize_job(self, job: SchedulerJob) -> dict[str, Any]:
        return {
            "id": job.id,
            "name": job.name,
            "jobType": job.job_type,
            "targetId": job.target_id,
            "schedule": job.schedule,
            "intervalSeconds": job.interval_seconds,
            "enabled": job.enabled,
            "status": job.status,
            "lastRun": job.last_run_at.isoformat() if job.last_run_at else None,
            "nextRun": job.next_run_at.isoformat() if job.next_run_at else None,
            "metadata": job.metadata_ or {},
        }

    def serialize_history(self, item: SchedulerRunHistory) -> dict[str, Any]:
        return {
            "id": item.id,
            "jobId": item.job_id,
            "status": item.status,
            "startedAt": item.started_at.isoformat(),
            "finishedAt": item.finished_at.isoformat() if item.finished_at else None,
            "message": item.message,
            "metadata": item.metadata_ or {},
        }

    async def jobs(self, *, page: int, page_size: int) -> dict[str, Any]:
        items, total = await self.repository.list(page=page, page_size=page_size)
        return {"items": [self.serialize_job(item) for item in items], "total": total, "page": page, "pageSize": page_size}

    async def status(self) -> dict[str, Any]:
        jobs = await self.jobs(page=1, page_size=500)
        running = sum(1 for job in jobs["items"] if job["status"] == "running")
        paused = sum(1 for job in jobs["items"] if not job["enabled"])
        return {"status": "operational", "totalJobs": jobs["total"], "runningJobs": running, "pausedJobs": paused}

    async def run(self, *, job_id: Optional[str], feed_id: Optional[str]) -> dict[str, Any]:
        await self.repository.ensure_default_jobs()
        job = await self.repository.get(job_id or "feed-sync-5m")
        if not job:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scheduler job not found")
        if not job.enabled:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Scheduler job is paused")
        await self.repository.set_status(job, "running")
        try:
            if feed_id:
                result = await self.feeds.sync(feed_id)
            elif job.job_type in {"feed_sync", "cve_update", "ioc_refresh"}:
                result = await self.feeds.sync_all()
            elif job.job_type == "feed_health":
                result = await self.feeds.health()
            elif job.job_type == "cache_cleanup":
                await feed_cache.clear()
                await dashboard_cache.clear()
                result = {"cacheCleared": True}
            else:
                result = {"message": "Job executed", "jobType": job.job_type}
            history = await self.repository.mark_run(job, status="success", message="Scheduler job completed", metadata={"result": result})
            return {"job": self.serialize_job(job), "history": self.serialize_history(history), "result": result}
        except Exception as exc:
            history = await self.repository.mark_run(job, status="failed", message=str(exc), metadata={})
            return {"job": self.serialize_job(job), "history": self.serialize_history(history), "result": {"error": str(exc)}}

    async def pause(self, job_id: str) -> dict[str, Any]:
        job = await self.repository.get(job_id)
        if not job:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scheduler job not found")
        await self.repository.set_status(job, "paused", enabled=False)
        return self.serialize_job(job)

    async def resume(self, job_id: str) -> dict[str, Any]:
        job = await self.repository.get(job_id)
        if not job:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scheduler job not found")
        await self.repository.set_status(job, "idle", enabled=True)
        return self.serialize_job(job)

    async def history(self, *, job_id: Optional[str], page: int, page_size: int) -> dict[str, Any]:
        items, total = await self.repository.history(job_id=job_id, page=page, page_size=page_size)
        return {"items": [self.serialize_history(item) for item in items], "total": total, "page": page, "pageSize": page_size}
