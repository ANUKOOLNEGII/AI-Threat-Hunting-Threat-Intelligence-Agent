from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy import Boolean, DateTime, Float, Index, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.threat_intel.models.base import Base


class CVE(Base):
    __tablename__ = "cves"
    __table_args__ = (
        Index("ix_cves_vendor_product", "vendor", "product"),
        Index("ix_cves_severity_cvss", "severity", "cvss_score"),
        Index("ix_cves_status_published", "status", "published_date"),
    )

    cve_id: Mapped[str] = mapped_column(String(32), primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    vendor: Mapped[str] = mapped_column(String(160), nullable=False, index=True)
    product: Mapped[str] = mapped_column(String(160), nullable=False, index=True)
    cvss_score: Mapped[float] = mapped_column(Float, nullable=False, index=True)
    severity: Mapped[str] = mapped_column(String(30), nullable=False, index=True)
    is_exploited: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(30), default="published", nullable=False, index=True)
    published_date: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)
    updated_date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    cvss_metrics: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    detection_rules: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)
    mitigation: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    mitre_attack: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)
    references: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)
    related_cves: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    metadata_: Mapped[dict[str, Any]] = mapped_column("metadata", JSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
