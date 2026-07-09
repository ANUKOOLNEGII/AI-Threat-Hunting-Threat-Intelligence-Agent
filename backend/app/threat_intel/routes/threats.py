from __future__ import annotations

from typing import Any, Optional

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.middleware.auth import rate_limit, require_roles
from app.database.session import get_session
from app.threat_intel.schemas.threat import ThreatCreate, ThreatUpdate
from app.threat_intel.services.threat_service import ThreatService

router = APIRouter(prefix="/threats", tags=["threats"])


@router.get("", response_model=dict[str, Any])
async def list_threats(
    query: Optional[str] = None,
    severity: Optional[str] = Query(default=None),
    category: Optional[str] = Query(default=None),
    status_filter: Optional[str] = Query(default=None, alias="status"),
    source: Optional[str] = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, alias="pageSize", ge=1, le=100),
    sort_by: str = Query(default="publishedAt", alias="sortBy"),
    sort_dir: str = Query(default="desc", alias="sortDir", pattern="^(asc|desc)$"),
    session: AsyncSession = Depends(get_session),
    _user=Depends(rate_limit()),
) -> dict[str, Any]:
    return await ThreatService(session).list(query=query, severity=severity, category=category, status=status_filter, source=source, page=page, page_size=page_size, sort_by=sort_by, sort_dir=sort_dir)


@router.get("/search", response_model=dict[str, Any])
async def search_threats(
    query: str = Query(min_length=1),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, alias="pageSize", ge=1, le=100),
    session: AsyncSession = Depends(get_session),
    _user=Depends(rate_limit()),
) -> dict[str, Any]:
    return await ThreatService(session).list(query=query, severity=None, category=None, status=None, source=None, page=page, page_size=page_size, sort_by="updatedAt", sort_dir="desc")


@router.get("/{threat_id}", response_model=dict[str, Any])
async def get_threat(threat_id: str, session: AsyncSession = Depends(get_session), _user=Depends(rate_limit())) -> dict[str, Any]:
    return await ThreatService(session).get(threat_id)


@router.post("", response_model=dict[str, Any], status_code=status.HTTP_201_CREATED)
async def create_threat(payload: ThreatCreate, session: AsyncSession = Depends(get_session), user=Depends(require_roles("admin", "analyst"))) -> dict[str, Any]:
    return await ThreatService(session).create(payload, user.id)


@router.put("/{threat_id}", response_model=dict[str, Any])
async def update_threat(threat_id: str, payload: ThreatUpdate, session: AsyncSession = Depends(get_session), user=Depends(require_roles("admin", "analyst"))) -> dict[str, Any]:
    return await ThreatService(session).update(threat_id, payload, user.id)


@router.delete("/{threat_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_threat(threat_id: str, session: AsyncSession = Depends(get_session), user=Depends(require_roles("admin"))) -> Response:
    await ThreatService(session).delete(threat_id, user.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
