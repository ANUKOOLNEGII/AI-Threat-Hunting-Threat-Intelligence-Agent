from __future__ import annotations

from typing import Any, Optional

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.middleware.auth import rate_limit, require_roles
from app.database.session import get_session
from app.threat_intel.schemas.ioc import IOCCreate, IOCUpdate
from app.threat_intel.services.ioc_service import IOCService

router = APIRouter(prefix="/iocs", tags=["iocs"])


@router.get("", response_model=dict[str, Any])
async def list_iocs(
    query: Optional[str] = None,
    type_filter: Optional[str] = Query(default=None, alias="type"),
    reputation: Optional[str] = None,
    status_filter: Optional[str] = Query(default=None, alias="status"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, alias="pageSize", ge=1, le=100),
    sort_by: str = Query(default="lastSeen", alias="sortBy"),
    sort_dir: str = Query(default="desc", alias="sortDir", pattern="^(asc|desc)$"),
    session: AsyncSession = Depends(get_session),
    _user=Depends(rate_limit()),
) -> dict[str, Any]:
    return await IOCService(session).list(query=query, type_=type_filter, reputation=reputation, status=status_filter, page=page, page_size=page_size, sort_by=sort_by, sort_dir=sort_dir)


@router.get("/{ioc_id}", response_model=dict[str, Any])
async def get_ioc(ioc_id: str, session: AsyncSession = Depends(get_session), _user=Depends(rate_limit())) -> dict[str, Any]:
    return await IOCService(session).get(ioc_id)


@router.post("", response_model=dict[str, Any], status_code=status.HTTP_201_CREATED)
async def create_ioc(payload: IOCCreate, session: AsyncSession = Depends(get_session), user=Depends(require_roles("admin", "analyst"))) -> dict[str, Any]:
    return await IOCService(session).create(payload, user.id)


@router.put("/{ioc_id}", response_model=dict[str, Any])
async def update_ioc(ioc_id: str, payload: IOCUpdate, session: AsyncSession = Depends(get_session), user=Depends(require_roles("admin", "analyst"))) -> dict[str, Any]:
    return await IOCService(session).update(ioc_id, payload, user.id)


@router.delete("/{ioc_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ioc(ioc_id: str, session: AsyncSession = Depends(get_session), user=Depends(require_roles("admin"))) -> Response:
    await IOCService(session).delete(ioc_id, user.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
