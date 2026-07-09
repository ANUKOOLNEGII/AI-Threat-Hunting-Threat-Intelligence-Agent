from __future__ import annotations

from datetime import datetime
from typing import Any, Literal, Optional

from pydantic import BaseModel, Field

IOCType = Literal["ip", "domain", "url", "sha256", "sha1", "md5", "email", "registry", "file"]
IOCReputation = Literal["malicious", "suspicious", "unknown", "trusted"]
IOCStatus = Literal["active", "investigating", "mitigated", "false-positive", "whitelist"]


class IOCBase(BaseModel):
    value: str = Field(min_length=1, max_length=512)
    type: IOCType
    reputation: IOCReputation = "unknown"
    confidence: int = Field(default=0, ge=0, le=100)
    source: str = Field(min_length=1, max_length=120)
    threatCount: int = Field(default=0, ge=0)
    firstSeen: datetime
    lastSeen: datetime
    status: IOCStatus = "active"
    description: Optional[str] = None
    whois: dict[str, Any] = Field(default_factory=dict)
    timeline: list[dict[str, Any]] = Field(default_factory=list)
    relationships: list[dict[str, Any]] = Field(default_factory=list)
    externalIntel: list[dict[str, Any]] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)


class IOCCreate(IOCBase):
    id: Optional[str] = Field(default=None, max_length=64)


class IOCUpdate(BaseModel):
    value: Optional[str] = Field(default=None, min_length=1, max_length=512)
    type: Optional[IOCType] = None
    reputation: Optional[IOCReputation] = None
    confidence: Optional[int] = Field(default=None, ge=0, le=100)
    source: Optional[str] = Field(default=None, min_length=1, max_length=120)
    threatCount: Optional[int] = Field(default=None, ge=0)
    firstSeen: Optional[datetime] = None
    lastSeen: Optional[datetime] = None
    status: Optional[IOCStatus] = None
    description: Optional[str] = None
    whois: Optional[dict[str, Any]] = None
    timeline: Optional[list[dict[str, Any]]] = None
    relationships: Optional[list[dict[str, Any]]] = None
    externalIntel: Optional[list[dict[str, Any]]] = None
    metadata: Optional[dict[str, Any]] = None


class IOCOut(IOCBase):
    id: str
