from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from enum import Enum
from datetime import datetime


class ReportType(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    EXECUTIVE = "executive"
    THREAT_INTELLIGENCE = "threat_intelligence"
    IOC = "ioc"
    MALWARE = "malware"
    CAMPAIGN = "campaign"


class ReportFormat(str, Enum):
    PDF = "pdf"
    HTML = "html"
    MARKDOWN = "markdown"
    JSON = "json"


class ReportStatus(str, Enum):
    PENDING = "pending"
    GENERATING = "generating"
    COMPLETED = "completed"
    FAILED = "failed"


class ReportBase(BaseModel):
    title: str
    type: ReportType
    format: ReportFormat
    filters: Optional[Dict[str, Any]] = None


class ReportCreate(ReportBase):
    is_scheduled: bool = False
    schedule_id: Optional[int] = None


class ReportUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[ReportStatus] = None
    report_metadata: Optional[Dict[str, Any]] = None


class ReportResponse(BaseModel):
    id: int
    title: str
    type: ReportType
    format: ReportFormat
    status: ReportStatus
    content: Optional[str] = None
    file_path: Optional[str] = None
    file_size: Optional[int] = None
    generated_by: Optional[int] = None
    generated_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    failed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    report_metadata: Optional[Dict[str, Any]] = None
    filters: Optional[Dict[str, Any]] = None
    is_scheduled: bool
    schedule_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ReportListResponse(BaseModel):
    items: List[ReportResponse]
    total: int
    page: int
    pageSize: int


class ReportData(BaseModel):
    executive_summary: str
    threat_statistics: Dict[str, Any]
    critical_cves: List[Dict[str, Any]]
    ioc_summary: List[Dict[str, Any]]
    threat_trends: List[Dict[str, Any]]
    ai_summary: Optional[str] = None
    detection_rules: Optional[List[Dict[str, Any]]] = None
    mitigation_recommendations: Optional[List[Dict[str, Any]]] = None
    references: Optional[List[Dict[str, Any]]] = None
    charts: Optional[Dict[str, Any]] = None
    metadata: Dict[str, Any]
