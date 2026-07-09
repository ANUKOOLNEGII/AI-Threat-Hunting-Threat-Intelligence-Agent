from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from enum import Enum
from datetime import datetime


class NotificationType(str, Enum):
    CRITICAL_THREAT = "critical_threat"
    FEED_SYNC = "feed_sync"
    AI_COMPLETION = "ai_completion"
    SCHEDULER_EVENT = "scheduler_event"
    SYSTEM_ALERT = "system_alert"
    REPORT_GENERATED = "report_generated"


class NotificationPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class NotificationBase(BaseModel):
    type: NotificationType
    priority: NotificationPriority = NotificationPriority.MEDIUM
    title: str
    message: str
    notification_metadata: Optional[Dict[str, Any]] = None


class NotificationCreate(NotificationBase):
    user_id: int


class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = None


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    type: NotificationType
    priority: NotificationPriority
    title: str
    message: str
    notification_metadata: Optional[Dict[str, Any]] = None
    is_read: bool
    read_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class NotificationListResponse(BaseModel):
    items: List[NotificationResponse]
    total: int
    unread_count: int
    page: int
    pageSize: int


class NotificationPreferenceBase(BaseModel):
    email_enabled: bool = True
    push_enabled: bool = True
    critical_alerts: bool = True
    threat_alerts: bool = True
    feed_alerts: bool = True
    system_alerts: bool = False


class NotificationPreferenceUpdate(NotificationPreferenceBase):
    pass


class NotificationPreferenceResponse(NotificationPreferenceBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
