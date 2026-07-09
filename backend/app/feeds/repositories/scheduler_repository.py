from __future__ import annotations

import uuid
from datetime import datetime, timedelta
from typing import Any, Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.feeds.models import SchedulerJob, SchedulerRunHistory


class SchedulerRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def ensure_default_jobs(self) -> None:
        defaults = [
            ("feed-sync-5m", "Feed Synchronization", "feed_sync", None, "*/5 * * * *", 300),
            ("cve-update-15m", "CVE Update", "cve_update", None, "*/15 * * * *", 900),
            ("ioc-refresh-30m", "IOC Refresh", "ioc_refresh", None, "*/30 * * * *", 1800),
            ("feed-health-10m", "Feed Health Check", "feed_health", None, "*/10 * * * *", 600),
            ("stats-refresh-hourly", "Threat Statistics Refresh", "statistics_refresh", None, "0 * * * *", 3600),
            ("cache-cleanup-daily", "Expired Cache Cleanup", "cache_cleanup", None, "0 0 * * *", 86400),
        ]
        for job_id, name, job_type, target_id, schedule, interval in defaults:
            if await self.get(job_id):
                continue
            now = datetime.utcnow()
            self.session.add(
                SchedulerJob(
                    id=job_id,
                    name=name,
                    job_type=job_type,
                    target_id=target_id,
                    schedule=schedule,
                    interval_seconds=interval,
                    next_run_at=now + timedelta(seconds=interval),
                    metadata_={"managed": True},
                )
            )
        await self.session.commit()

    async def list(self, *, page: int, page_size: int) -> tuple[list[SchedulerJob], int]:
        await self.ensure_default_jobs()
        stmt = select(SchedulerJob)
        total = int((await self.session.execute(select(func.count()).select_from(stmt.subquery()))).scalar_one())
        stmt = stmt.order_by(SchedulerJob.name).offset((page - 1) * page_size).limit(page_size)
        return list((await self.session.execute(stmt)).scalars().all()), total

    async def get(self, job_id: str) -> Optional[SchedulerJob]:
        return (await self.session.execute(select(SchedulerJob).where(SchedulerJob.id == job_id))).scalar_one_or_none()

    async def set_status(self, job: SchedulerJob, status: str, enabled: Optional[bool] = None) -> SchedulerJob:
        job.status = status
        if enabled is not None:
            job.enabled = enabled
        job.updated_at = datetime.utcnow()
        await self.session.commit()
        await self.session.refresh(job)
        return job

    async def mark_run(self, job: SchedulerJob, *, status: str, message: Optional[str], metadata: Optional[dict[str, Any]] = None) -> SchedulerRunHistory:
        now = datetime.utcnow()
        job.status = "idle" if status == "success" else "failed"
        job.last_run_at = now
        job.next_run_at = now + timedelta(seconds=job.interval_seconds)
        job.updated_at = now
        row = SchedulerRunHistory(id=f"jobrun-{uuid.uuid4().hex[:12]}", job_id=job.id, status=status, finished_at=now, message=message, metadata_=metadata or {})
        self.session.add(row)
        await self.session.commit()
        await self.session.refresh(row)
        return row

    async def history(self, *, job_id: Optional[str], page: int, page_size: int) -> tuple[list[SchedulerRunHistory], int]:
        stmt = select(SchedulerRunHistory)
        if job_id:
            stmt = stmt.where(SchedulerRunHistory.job_id == job_id)
        total = int((await self.session.execute(select(func.count()).select_from(stmt.subquery()))).scalar_one())
        stmt = stmt.order_by(SchedulerRunHistory.started_at.desc()).offset((page - 1) * page_size).limit(page_size)
        return list((await self.session.execute(stmt)).scalars().all()), total
