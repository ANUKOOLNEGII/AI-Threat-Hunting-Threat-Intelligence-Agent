from __future__ import annotations

from datetime import datetime
from typing import Any, Literal, Optional

from pydantic import BaseModel, Field

CVESeverity = Literal["critical", "high", "medium", "low", "informational"]
CVEStatus = Literal["published", "modified", "rejected", "reserved"]


class CVEReference(BaseModel):
    source: str
    url: str
    name: Optional[str] = None


class CVEBase(BaseModel):
    title: str = Field(min_length=3, max_length=255)
    description: str = Field(min_length=3)
    vendor: str = Field(min_length=1, max_length=160)
    product: str = Field(min_length=1, max_length=160)
    cvssScore: float = Field(ge=0, le=10)
    severity: CVESeverity
    isExploited: bool = False
    status: CVEStatus = "published"
    publishedDate: datetime
    updatedDate: Optional[datetime] = None
    cvssMetrics: dict[str, Any] = Field(default_factory=dict)
    detectionRules: list[dict[str, Any]] = Field(default_factory=list)
    mitigation: dict[str, Any] = Field(default_factory=dict)
    mitreAttack: list[dict[str, Any]] = Field(default_factory=list)
    references: list[CVEReference] = Field(default_factory=list)
    relatedCves: list[str] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)


class CVECreate(CVEBase):
    cveId: str = Field(pattern=r"^CVE-\d{4}-\d{4,}$")


class CVEUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=3, max_length=255)
    description: Optional[str] = Field(default=None, min_length=3)
    vendor: Optional[str] = Field(default=None, min_length=1, max_length=160)
    product: Optional[str] = Field(default=None, min_length=1, max_length=160)
    cvssScore: Optional[float] = Field(default=None, ge=0, le=10)
    severity: Optional[CVESeverity] = None
    isExploited: Optional[bool] = None
    status: Optional[CVEStatus] = None
    publishedDate: Optional[datetime] = None
    updatedDate: Optional[datetime] = None
    cvssMetrics: Optional[dict[str, Any]] = None
    detectionRules: Optional[list[dict[str, Any]]] = None
    mitigation: Optional[dict[str, Any]] = None
    mitreAttack: Optional[list[dict[str, Any]]] = None
    references: Optional[list[CVEReference]] = None
    relatedCves: Optional[list[str]] = None
    metadata: Optional[dict[str, Any]] = None


class CVEOut(CVEBase):
    cveId: str
    updatedDate: datetime
