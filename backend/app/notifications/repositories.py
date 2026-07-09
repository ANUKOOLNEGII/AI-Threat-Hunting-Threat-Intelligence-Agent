from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func, and_
from .models import (
    Notification,
    NotificationPreference,
    NotificationType,
    NotificationPriority,
)
from datetime import datetime


class NotificationRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, notification_data: Dict[str, Any]) -> Notification:
        notification = Notification(**notification_data)
        self.session.add(notification)
        await self.session.commit()
        await self.session.refresh(notification)
        return notification

    async def get_by_id(self, notification_id: int) -> Optional[Notification]:
        result = await self.session.execute(
            select(Notification).where(Notification.id == notification_id)
        )
        return result.scalar_one_or_none()

    async def list_by_user(
        self,
        user_id: int,
        page: int = 1,
        page_size: int = 20,
        is_read: Optional[bool] = None,
        notification_type: Optional[NotificationType] = None,
        priority: Optional[NotificationPriority] = None,
    ) -> tuple[List[Notification], int, int]:
        query = select(Notification).where(Notification.user_id == user_id)
        
        filters = []
        if is_read is not None:
            filters.append(Notification.is_read == is_read)
        if notification_type:
            filters.append(Notification.type == notification_type)
        if priority:
            filters.append(Notification.priority == priority)
        
        if filters:
            query = query.where(and_(*filters))
        
        # Count total
        count_query = select(func.count()).select_from(query.subquery())
        count_result = await self.session.execute(count_query)
        total = count_result.scalar_one()
        
        # Count unread
        unread_query = select(func.count()).select_from(
            select(Notification).where(
                and_(Notification.user_id == user_id, Notification.is_read == False)
            ).subquery()
        )
        unread_result = await self.session.execute(unread_query)
        unread_count = unread_result.scalar_one()
        
        # Get items
        query = query.order_by(Notification.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        result = await self.session.execute(query)
        items = list(result.scalars().all())
        
        return items, total, unread_count

    async def update(self, notification_id: int, update_data: Dict[str, Any]) -> Optional[Notification]:
        notification = await self.get_by_id(notification_id)
        if not notification:
            return None
        
        for key, value in update_data.items():
            setattr(notification, key, value)
        
        if update_data.get("is_read") and not notification.read_at:
            notification.read_at = datetime.utcnow()
        
        await self.session.commit()
        await self.session.refresh(notification)
        return notification

    async def mark_all_read(self, user_id: int) -> int:
        result = await self.session.execute(
            update(Notification)
            .where(and_(Notification.user_id == user_id, Notification.is_read == False))
            .values(is_read=True, read_at=datetime.utcnow())
        )
        await self.session.commit()
        return result.rowcount

    async def delete(self, notification_id: int) -> bool:
        notification = await self.get_by_id(notification_id)
        if not notification:
            return False
        
        await self.session.delete(notification)
        await self.session.commit()
        return True


class NotificationPreferenceRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_user_id(self, user_id: int) -> Optional[NotificationPreference]:
        result = await self.session.execute(
            select(NotificationPreference).where(NotificationPreference.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def create_or_update(
        self,
        user_id: int,
        preference_data: Dict[str, Any],
    ) -> NotificationPreference:
        preference = await self.get_by_user_id(user_id)
        
        if preference:
            for key, value in preference_data.items():
                setattr(preference, key, value)
        else:
            preference_data["user_id"] = user_id
            preference = NotificationPreference(**preference_data)
            self.session.add(preference)
        
        await self.session.commit()
        await self.session.refresh(preference)
        return preference
