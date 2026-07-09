from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Enum as SQLEnum,
    JSON,
    Boolean,
    ForeignKey,
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from enum import Enum

from app.auth.models.user import Base


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


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    type = Column(SQLEnum(ReportType), nullable=False, index=True)
    format = Column(SQLEnum(ReportFormat), nullable=False)
    status = Column(SQLEnum(ReportStatus), default=ReportStatus.PENDING, nullable=False, index=True)
    content = Column(Text, nullable=True)
    file_path = Column(String(512), nullable=True)
    file_size = Column(Integer, nullable=True)
    generated_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    generated_at = Column(DateTime(timezone=True), nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    failed_at = Column(DateTime(timezone=True), nullable=True)
    error_message = Column(Text, nullable=True)
    report_metadata = Column(JSON, nullable=True)
    filters = Column(JSON, nullable=True)
    is_scheduled = Column(Boolean, default=False)
    schedule_id = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    generator = relationship("User", foreign_keys=[generated_by])
