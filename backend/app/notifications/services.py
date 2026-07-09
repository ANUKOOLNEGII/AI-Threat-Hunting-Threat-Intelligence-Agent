from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from .models import (
    Notification,
    NotificationPreference,
    NotificationType,
    NotificationPriority,
)
from .schemas import (
    NotificationCreate,
    NotificationUpdate,
    NotificationPreferenceUpdate,
)
from .repositories import NotificationRepository, NotificationPreferenceRepository


class NotificationService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repo = NotificationRepository(session)
        self.preference_repo = NotificationPreferenceRepository(session)

    async def create_notification(
        self,
        notification_data: NotificationCreate,
    ) -> Notification:
        return await self.repo.create(notification_data.model_dump())

    async def get_notification(
        self,
        notification_id: int,
        user_id: int,
    ) -> Optional[Notification]:
        notification = await self.repo.get_by_id(notification_id)
        if not notification or notification.user_id != user_id:
            return None
        return notification

    async def list_notifications(
        self,
        user_id: int,
        page: int = 1,
        page_size: int = 20,
        is_read: Optional[bool] = None,
        notification_type: Optional[NotificationType] = None,
        priority: Optional[NotificationPriority] = None,
    ) -> Tuple[List[Notification], int, int]:
        return await self.repo.list_by_user(
            user_id=user_id,
            page=page,
            page_size=page_size,
            is_read=is_read,
            notification_type=notification_type,
            priority=priority,
        )

    async def mark_read(
        self,
        notification_id: int,
        user_id: int,
    ) -> Optional[Notification]:
        notification = await self.get_notification(notification_id, user_id)
        if not notification:
            return None
        return await self.repo.update(notification_id, {"is_read": True})

    async def mark_all_read(self, user_id: int) -> int:
        return await self.repo.mark_all_read(user_id)

    async def delete_notification(
        self,
        notification_id: int,
        user_id: int,
    ) -> bool:
        notification = await self.get_notification(notification_id, user_id)
        if not notification:
            return False
        return await self.repo.delete(notification_id)

    async def get_preferences(self, user_id: int) -> NotificationPreference:
        preference = await self.preference_repo.get_by_user_id(user_id)
        if not preference:
            return await self.preference_repo.create_or_update(user_id, {})
        return preference

    async def update_preferences(
        self,
        user_id: int,
        preference_data: NotificationPreferenceUpdate,
    ) -> NotificationPreference:
        return await self.preference_repo.create_or_update(
            user_id,
            preference_data.model_dump(),
        )


async def send_notification(
    session: AsyncSession,
    user_id: int,
    notification_type: NotificationType,
    title: str,
    message: str,
    priority: NotificationPriority = NotificationPriority.MEDIUM,
    notification_metadata: Optional[Dict[str, Any]] = None,
) -> Notification:
    """Helper function to send a notification"""
    service = NotificationService(session)
    return await service.create_notification(
        NotificationCreate(
            user_id=user_id,
            type=notification_type,
            priority=priority,
            title=title,
            message=message,
            notification_metadata=notification_metadata,
        )
    )
