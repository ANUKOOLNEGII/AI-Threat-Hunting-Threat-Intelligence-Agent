from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from ..database.session import get_session
from ..auth.middleware.auth import get_current_user
from .schemas import (
    NotificationResponse,
    NotificationListResponse,
    NotificationUpdate,
    NotificationPreferenceResponse,
    NotificationPreferenceUpdate,
    NotificationType,
    NotificationPriority,
)
from .services import NotificationService

router = APIRouter()


@router.get("/notifications", response_model=NotificationListResponse)
async def list_notifications(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    is_read: Optional[bool] = None,
    notification_type: Optional[NotificationType] = None,
    priority: Optional[NotificationPriority] = None,
    db: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
):
    """List notifications for current user"""
    service = NotificationService(db)
    items, total, unread_count = await service.list_notifications(
        user_id=current_user.id,
        page=page,
        page_size=page_size,
        is_read=is_read,
        notification_type=notification_type,
        priority=priority,
    )
    return NotificationListResponse(
        items=items,
        total=total,
        unread_count=unread_count,
        page=page,
        pageSize=page_size,
    )


@router.get("/notifications/{notification_id}", response_model=NotificationResponse)
async def get_notification(
    notification_id: int,
    db: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
):
    """Get a specific notification"""
    service = NotificationService(db)
    notification = await service.get_notification(notification_id, current_user.id)
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )
    return notification


@router.put("/notifications/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_read(
    notification_id: int,
    db: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
):
    """Mark a notification as read"""
    service = NotificationService(db)
    notification = await service.mark_read(notification_id, current_user.id)
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )
    return notification


@router.put("/notifications/read-all", status_code=status.HTTP_200_OK)
async def mark_all_notifications_read(
    db: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
):
    """Mark all notifications as read"""
    service = NotificationService(db)
    count = await service.mark_all_read(current_user.id)
    return {"marked_read": count}


@router.delete("/notifications/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    notification_id: int,
    db: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
):
    """Delete a notification"""
    service = NotificationService(db)
    success = await service.delete_notification(notification_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )


@router.get("/notification-preferences", response_model=NotificationPreferenceResponse)
async def get_notification_preferences(
    db: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
):
    """Get notification preferences"""
    service = NotificationService(db)
    return await service.get_preferences(current_user.id)


@router.put("/notification-preferences", response_model=NotificationPreferenceResponse)
async def update_notification_preferences(
    preferences: NotificationPreferenceUpdate,
    db: AsyncSession = Depends(get_session),
    current_user = Depends(get_current_user),
):
    """Update notification preferences"""
    service = NotificationService(db)
    return await service.update_preferences(current_user.id, preferences)
