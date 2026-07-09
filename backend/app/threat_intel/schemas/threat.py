from __future__ import annotations

from datetime import datetime
from typing import Any, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

ThreatSeverity = Literal["critical", "high", "medium", "low", "informational"]
ThreatStatus = Literal["active", "investigating", "closed", "new", "archived"]
ThreatCategory = Literal["vulnerability", "campaign", "malware", "ransomware", "phishing", "data-breach", "apt", "zero-day", "advisory"]
ThreatSourceType = Literal["nvd", "cisa", "vendor", "community", "internal"]


class ThreatSource(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    url: Optional[str] = Field(default=None, max_length=500)
    type: ThreatSourceType


class ThreatTag(BaseModel):
    id: str = Field(min_length=1, max_length=64)
    label: str = Field(min_length=1, max_length=80)
    color: Optional[Literal["blue", "red", "yellow", "green", "gray", "purple"]] = None


class ThreatTimelineEvent(BaseModel):
    id: str
    timestamp: datetime
    title: str
    description: str
    type: Literal["published", "collected", "analyzed", "updated", "closed", "escalated"]


class ThreatIOCRef(BaseModel):
    type: Literal["ip", "domain", "hash", "url", "email"]
    value: str


class RelatedThreat(BaseModel):
    id: str
    title: str
    severity: ThreatSeverity
    category: ThreatCategory
    publishedAt: datetime


class ThreatBase(BaseModel):
    title: str = Field(min_length=3, max_length=255)
    summary: str = Field(min_length=3)
    category: ThreatCategory
    severity: ThreatSeverity
    status: ThreatStatus = "new"
    source: ThreatSource
    publishedAt: datetime
    updatedAt: Optional[datetime] = None
    tags: list[ThreatTag] = Field(default_factory=list)
    description: Optional[str] = None
    affectedVendor: Optional[str] = None
    affectedProduct: Optional[str] = None
    cvssScore: Optional[float] = Field(default=None, ge=0, le=10)
    referenceIds: list[str] = Field(default_factory=list)
    timeline: list[ThreatTimelineEvent] = Field(default_factory=list)
    iocRefs: list[ThreatIOCRef] = Field(default_factory=list)
    relatedThreats: list[RelatedThreat] = Field(default_factory=list)
    references: list[str] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)


class ThreatCreate(ThreatBase):
    id: Optional[str] = Field(default=None, max_length=64)


class ThreatUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=3, max_length=255)
    summary: Optional[str] = Field(default=None, min_length=3)
    category: Optional[ThreatCategory] = None
    severity: Optional[ThreatSeverity] = None
    status: Optional[ThreatStatus] = None
    source: Optional[ThreatSource] = None
    publishedAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
    tags: Optional[list[ThreatTag]] = None
    description: Optional[str] = None
    affectedVendor: Optional[str] = None
    affectedProduct: Optional[str] = None
    cvssScore: Optional[float] = Field(default=None, ge=0, le=10)
    referenceIds: Optional[list[str]] = None
    timeline: Optional[list[ThreatTimelineEvent]] = None
    iocRefs: Optional[list[ThreatIOCRef]] = None
    relatedThreats: Optional[list[RelatedThreat]] = None
    references: Optional[list[str]] = None
    metadata: Optional[dict[str, Any]] = None


class ThreatOut(ThreatBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    updatedAt: datetime
