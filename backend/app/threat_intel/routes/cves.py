from __future__ import annotations

from typing import Any, Optional

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.middleware.auth import rate_limit, require_roles
from app.database.session import get_session
from app.threat_intel.schemas.cve import CVECreate, CVEUpdate
from app.threat_intel.services.cve_service import CVEService

router = APIRouter(prefix="/cves", tags=["cves"])


@router.get("", response_model=dict[str, Any])
async def list_cves(
    query: Optional[str] = None,
    severity: Optional[str] = None,
    is_exploited: Optional[str] = Query(default=None, alias="isExploited"),
    vendor: Optional[str] = None,
    product: Optional[str] = None,
    status_filter: Optional[str] = Query(default=None, alias="status"),
    min_cvss: Optional[float] = Query(default=None, alias="minCvss", ge=0, le=10),
    max_cvss: Optional[float] = Query(default=None, alias="maxCvss", ge=0, le=10),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, alias="pageSize", ge=1, le=100),
    sort_by: str = Query(default="publishedDate", alias="sortBy"),
    sort_dir: str = Query(default="desc", alias="sortDir", pattern="^(asc|desc)$"),
    session: AsyncSession = Depends(get_session),
    _user=Depends(rate_limit()),
) -> dict[str, Any]:
    return await CVEService(session).list(query=query, severity=severity, vendor=vendor, product=product, status=status_filter, exploited=is_exploited, min_cvss=min_cvss, max_cvss=max_cvss, page=page, page_size=page_size, sort_by=sort_by, sort_dir=sort_dir)


@router.get("/{cve_id}", response_model=dict[str, Any])
async def get_cve(cve_id: str, session: AsyncSession = Depends(get_session), _user=Depends(rate_limit())) -> dict[str, Any]:
    return await CVEService(session).get(cve_id)


@router.post("", response_model=dict[str, Any], status_code=status.HTTP_201_CREATED)
async def create_cve(payload: CVECreate, session: AsyncSession = Depends(get_session), user=Depends(require_roles("admin", "analyst"))) -> dict[str, Any]:
    return await CVEService(session).create(payload, user.id)


@router.put("/{cve_id}", response_model=dict[str, Any])
async def update_cve(cve_id: str, payload: CVEUpdate, session: AsyncSession = Depends(get_session), user=Depends(require_roles("admin", "analyst"))) -> dict[str, Any]:
    return await CVEService(session).update(cve_id, payload, user.id)


@router.delete("/{cve_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_cve(cve_id: str, session: AsyncSession = Depends(get_session), user=Depends(require_roles("admin"))) -> Response:
    await CVEService(session).delete(cve_id, user.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
