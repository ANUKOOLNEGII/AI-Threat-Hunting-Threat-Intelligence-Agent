from __future__ import annotations

from typing import Any, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.middleware.auth import rate_limit, require_roles
from app.database.session import get_session
from app.feeds.schemas.scheduler import SchedulerControlRequest, SchedulerRunRequest
from app.feeds.services.scheduler_service import SchedulerService

router = APIRouter(prefix="/scheduler", tags=["scheduler"])


@router.get("/jobs", response_model=dict[str, Any])
async def jobs(page: int = Query(default=1, ge=1), page_size: int = Query(default=10, alias="pageSize", ge=1, le=100), session: AsyncSession = Depends(get_session), _user=Depends(rate_limit())) -> dict[str, Any]:
    return await SchedulerService(session).jobs(page=page, page_size=page_size)


@router.post("/run", response_model=dict[str, Any])
async def run_job(payload: SchedulerRunRequest, session: AsyncSession = Depends(get_session), _user=Depends(require_roles("admin", "analyst"))) -> dict[str, Any]:
    return await SchedulerService(session).run(job_id=payload.jobId, feed_id=payload.feedId)


@router.post("/pause", response_model=dict[str, Any])
async def pause_job(payload: SchedulerControlRequest, session: AsyncSession = Depends(get_session), _user=Depends(require_roles("admin"))) -> dict[str, Any]:
    return await SchedulerService(session).pause(payload.jobId)


@router.post("/resume", response_model=dict[str, Any])
async def resume_job(payload: SchedulerControlRequest, session: AsyncSession = Depends(get_session), _user=Depends(require_roles("admin"))) -> dict[str, Any]:
    return await SchedulerService(session).resume(payload.jobId)


@router.get("/history", response_model=dict[str, Any])
async def history(job_id: Optional[str] = Query(default=None, alias="jobId"), page: int = Query(default=1, ge=1), page_size: int = Query(default=10, alias="pageSize", ge=1, le=100), session: AsyncSession = Depends(get_session), _user=Depends(rate_limit())) -> dict[str, Any]:
    return await SchedulerService(session).history(job_id=job_id, page=page, page_size=page_size)


@router.get("/status", response_model=dict[str, Any])
async def status(session: AsyncSession = Depends(get_session), _user=Depends(rate_limit())) -> dict[str, Any]:
    return await SchedulerService(session).status()
