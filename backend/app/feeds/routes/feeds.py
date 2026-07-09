from __future__ import annotations

from typing import Any, Optional

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.middleware.auth import rate_limit, require_roles
from app.database.session import get_session
from app.feeds.schemas.feed import FeedCreate, FeedSyncRequest, FeedUpdate
from app.feeds.services.feed_service import FeedService

router = APIRouter(prefix="/feeds", tags=["feeds"])


@router.get("", response_model=dict[str, Any])
async def list_feeds(
    query: Optional[str] = None,
    enabled: Optional[bool] = None,
    status_filter: Optional[str] = Query(default=None, alias="status"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, alias="pageSize", ge=1, le=100),
    session: AsyncSession = Depends(get_session),
    _user=Depends(rate_limit()),
) -> dict[str, Any]:
    return await FeedService(session).list(query=query, enabled=enabled, status_filter=status_filter, page=page, page_size=page_size)


@router.post("", response_model=dict[str, Any], status_code=status.HTTP_201_CREATED)
async def create_feed(payload: FeedCreate, session: AsyncSession = Depends(get_session), user=Depends(require_roles("admin", "analyst"))) -> dict[str, Any]:
    return await FeedService(session).create(payload, user.id)


@router.put("/{feed_id}", response_model=dict[str, Any])
async def update_feed(feed_id: str, payload: FeedUpdate, session: AsyncSession = Depends(get_session), user=Depends(require_roles("admin", "analyst"))) -> dict[str, Any]:
    return await FeedService(session).update(feed_id, payload, user.id)


@router.delete("/{feed_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_feed(feed_id: str, session: AsyncSession = Depends(get_session), user=Depends(require_roles("admin"))) -> Response:
    await FeedService(session).delete(feed_id, user.id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/status", response_model=dict[str, Any])
async def feed_status(session: AsyncSession = Depends(get_session), _user=Depends(rate_limit())) -> dict[str, Any]:
    return await FeedService(session).status()


@router.get("/history", response_model=dict[str, Any])
async def feed_history(
    feed_id: Optional[str] = Query(default=None, alias="feedId"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, alias="pageSize", ge=1, le=100),
    session: AsyncSession = Depends(get_session),
    _user=Depends(rate_limit()),
) -> dict[str, Any]:
    return await FeedService(session).history(feed_id=feed_id, page=page, page_size=page_size)


@router.get("/statistics", response_model=dict[str, Any])
async def feed_statistics(session: AsyncSession = Depends(get_session), _user=Depends(rate_limit())) -> dict[str, Any]:
    return await FeedService(session).statistics()


@router.post("/sync", response_model=dict[str, Any])
async def sync_feeds(payload: Optional[FeedSyncRequest] = None, session: AsyncSession = Depends(get_session), user=Depends(require_roles("admin", "analyst"))) -> dict[str, Any]:
    return await FeedService(session).sync_all(use_network=payload.useNetwork if payload else False)


@router.post("/sync/{feed_id}", response_model=dict[str, Any])
async def sync_feed(feed_id: str, payload: Optional[FeedSyncRequest] = None, session: AsyncSession = Depends(get_session), user=Depends(require_roles("admin", "analyst"))) -> dict[str, Any]:
    return await FeedService(session).sync(feed_id, use_network=payload.useNetwork if payload else False)


@router.get("/logs", response_model=dict[str, Any])
async def feed_logs(
    feed_id: Optional[str] = Query(default=None, alias="feedId"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, alias="pageSize", ge=1, le=100),
    session: AsyncSession = Depends(get_session),
    _user=Depends(rate_limit()),
) -> dict[str, Any]:
    return await FeedService(session).logs(feed_id=feed_id, page=page, page_size=page_size)


@router.get("/health", response_model=dict[str, Any])
async def feeds_health(session: AsyncSession = Depends(get_session), _user=Depends(rate_limit())) -> dict[str, Any]:
    return await FeedService(session).health()
