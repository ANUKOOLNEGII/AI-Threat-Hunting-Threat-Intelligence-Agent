from __future__ import annotations

from datetime import datetime
from typing import Any, Literal, Optional

from pydantic import BaseModel, Field

FeedType = Literal["nvd", "cisa_kev", "virustotal", "shodan", "alienvault_otx", "github_security", "misp", "mitre_attack", "rss", "vendor_advisory", "sample"]
FeedStatus = Literal["idle", "syncing", "synchronized", "failed", "disabled", "paused"]
AuthType = Literal["none", "api_key", "bearer", "header"]


class FeedCreate(BaseModel):
    id: Optional[str] = Field(default=None, max_length=64)
    name: str = Field(min_length=2, max_length=160)
    provider: str = Field(min_length=2, max_length=160)
    feedType: FeedType
    url: Optional[str] = Field(default=None, max_length=800)
    enabled: bool = True
    authType: AuthType = "none"
    apiKeyEnv: Optional[str] = Field(default=None, max_length=160)
    schedule: str = Field(default="manual", max_length=80)
    intervalSeconds: int = Field(default=300, ge=60, le=86400)
    timeoutSeconds: int = Field(default=20, ge=1, le=120)
    retryCount: int = Field(default=3, ge=0, le=10)
    rateLimitPerMinute: int = Field(default=60, ge=1, le=1000)
    metadata: dict[str, Any] = Field(default_factory=dict)


class FeedUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=160)
    provider: Optional[str] = Field(default=None, min_length=2, max_length=160)
    feedType: Optional[FeedType] = None
    url: Optional[str] = Field(default=None, max_length=800)
    enabled: Optional[bool] = None
    status: Optional[FeedStatus] = None
    authType: Optional[AuthType] = None
    apiKeyEnv: Optional[str] = Field(default=None, max_length=160)
    schedule: Optional[str] = Field(default=None, max_length=80)
    intervalSeconds: Optional[int] = Field(default=None, ge=60, le=86400)
    timeoutSeconds: Optional[int] = Field(default=None, ge=1, le=120)
    retryCount: Optional[int] = Field(default=None, ge=0, le=10)
    rateLimitPerMinute: Optional[int] = Field(default=None, ge=1, le=1000)
    metadata: Optional[dict[str, Any]] = None


class FeedOut(BaseModel):
    id: str
    name: str
    provider: str
    feedType: str
    url: Optional[str]
    enabled: bool
    status: str
    healthStatus: str
    authType: str
    apiKeyEnv: Optional[str]
    schedule: str
    intervalSeconds: int
    timeoutSeconds: int
    retryCount: int
    rateLimitPerMinute: int
    lastSync: Optional[datetime]
    nextSync: Optional[datetime]
    recordsProcessed: int
    successRate: float
    metadata: dict[str, Any]
    createdAt: datetime
    updatedAt: datetime


class FeedSyncRequest(BaseModel):
    force: bool = False
    useNetwork: bool = False


class FeedSyncResult(BaseModel):
    feedId: str
    status: str
    received: int
    created: int
    updated: int
    rejected: int
    errors: list[str] = Field(default_factory=list)


class FeedHistoryOut(BaseModel):
    id: str
    feedId: str
    status: str
    startedAt: datetime
    finishedAt: Optional[datetime]
    recordsReceived: int
    recordsCreated: int
    recordsUpdated: int
    recordsRejected: int
    errorMessage: Optional[str]
    metadata: dict[str, Any]


class FeedLogOut(BaseModel):
    id: str
    feedId: Optional[str]
    level: str
    message: str
    eventType: str
    createdAt: datetime
    metadata: dict[str, Any]
