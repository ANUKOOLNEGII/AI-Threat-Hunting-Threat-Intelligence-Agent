from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.middleware.auth import rate_limit
from app.database.session import get_session
from app.threat_intel.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=dict[str, Any])
async def summary(session: AsyncSession = Depends(get_session), _user=Depends(rate_limit())) -> dict[str, Any]:
    return await DashboardService(session).summary()


@router.get("/statistics", response_model=dict[str, Any])
async def statistics(session: AsyncSession = Depends(get_session), _user=Depends(rate_limit())) -> dict[str, Any]:
    return await DashboardService(session).statistics()


@router.get("/widgets", response_model=dict[str, Any])
async def widgets(session: AsyncSession = Depends(get_session), _user=Depends(rate_limit())) -> dict[str, Any]:
    return await DashboardService(session).widgets()


@router.get("/trends", response_model=dict[str, Any])
async def trends(session: AsyncSession = Depends(get_session), _user=Depends(rate_limit())) -> dict[str, Any]:
    return await DashboardService(session).trends()


@router.get("/timeline", response_model=dict[str, Any])
async def timeline(limit: int = Query(default=20, ge=1, le=100), session: AsyncSession = Depends(get_session), _user=Depends(rate_limit())) -> dict[str, Any]:
    return await DashboardService(session).timeline(limit)


@router.get("/alerts", response_model=dict[str, Any])
async def alerts(page: int = Query(default=1, ge=1), page_size: int = Query(default=10, alias="pageSize", ge=1, le=100), session: AsyncSession = Depends(get_session), _user=Depends(rate_limit())) -> dict[str, Any]:
    return await DashboardService(session).recent_alerts(page, page_size)


@router.get("/feed-status", response_model=dict[str, Any])
async def feed_status(session: AsyncSession = Depends(get_session), _user=Depends(rate_limit())) -> dict[str, Any]:
    return await DashboardService(session).feed_status()


@router.get("/system-status", response_model=dict[str, Any])
async def system_status(session: AsyncSession = Depends(get_session), _user=Depends(rate_limit())) -> dict[str, Any]:
    return await DashboardService(session).system_status()


@router.get("/severity", response_model=dict[str, Any])
async def severity(session: AsyncSession = Depends(get_session), _user=Depends(rate_limit())) -> dict[str, Any]:
    return await DashboardService(session).severity_distribution()


@router.get("/sources", response_model=dict[str, Any])
async def sources(session: AsyncSession = Depends(get_session), _user=Depends(rate_limit())) -> dict[str, Any]:
    return await DashboardService(session).source_distribution()


@router.post("/refresh", response_model=dict[str, Any])
async def refresh(session: AsyncSession = Depends(get_session), _user=Depends(rate_limit())) -> dict[str, Any]:
    return await DashboardService(session).refresh()


@router.get("/metadata", response_model=dict[str, Any])
async def metadata(session: AsyncSession = Depends(get_session), _user=Depends(rate_limit())) -> dict[str, Any]:
    return await DashboardService(session).metadata()
