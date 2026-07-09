from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from sqlalchemy import DateTime, Index, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.threat_intel.models.base import Base


class IOC(Base):
    __tablename__ = "iocs"
    __table_args__ = (
        Index("ix_iocs_type_reputation", "type", "reputation"),
        Index("ix_iocs_status_last_seen", "status", "last_seen"),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    value: Mapped[str] = mapped_column(String(512), unique=True, nullable=False, index=True)
    type: Mapped[str] = mapped_column(String(30), nullable=False, index=True)
    reputation: Mapped[str] = mapped_column(String(30), nullable=False, index=True)
    confidence: Mapped[int] = mapped_column(Integer, default=0, nullable=False, index=True)
    source: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    threat_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    first_seen: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    last_seen: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(30), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    whois: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    timeline: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)
    relationships: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)
    external_intel: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)
    metadata_: Mapped[dict[str, Any]] = mapped_column("metadata", JSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
