from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from sqlalchemy import Boolean, DateTime, Float, Index, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.threat_intel.models.base import Base


class ThreatFeed(Base):
    __tablename__ = "threat_feeds"
    __table_args__ = (
        Index("ix_threat_feeds_type_enabled", "feed_type", "enabled"),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(160), nullable=False, index=True)
    provider: Mapped[str] = mapped_column(String(160), nullable=False, index=True)
    feed_type: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    url: Mapped[Optional[str]] = mapped_column(String(800), nullable=True)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    status: Mapped[str] = mapped_column(String(40), default="idle", nullable=False, index=True)
    health_status: Mapped[str] = mapped_column(String(40), default="unknown", nullable=False)
    auth_type: Mapped[str] = mapped_column(String(40), default="none", nullable=False)
    api_key_env: Mapped[Optional[str]] = mapped_column(String(160), nullable=True)
    schedule: Mapped[str] = mapped_column(String(80), default="manual", nullable=False)
    interval_seconds: Mapped[int] = mapped_column(Integer, default=300, nullable=False)
    timeout_seconds: Mapped[int] = mapped_column(Integer, default=20, nullable=False)
    retry_count: Mapped[int] = mapped_column(Integer, default=3, nullable=False)
    rate_limit_per_minute: Mapped[int] = mapped_column(Integer, default=60, nullable=False)
    last_sync_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True, index=True)
    next_sync_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True, index=True)
    records_processed: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    success_rate: Mapped[float] = mapped_column(Float, default=100.0, nullable=False)
    metadata_: Mapped[dict[str, Any]] = mapped_column("metadata", JSON, default=dict, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)


class FeedSyncHistory(Base):
    __tablename__ = "feed_sync_history"
    __table_args__ = (
        Index("ix_feed_sync_history_feed_started", "feed_id", "started_at"),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    feed_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(40), nullable=False, index=True)
    started_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    finished_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    records_received: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    records_created: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    records_updated: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    records_rejected: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    metadata_: Mapped[dict[str, Any]] = mapped_column("metadata", JSON, default=dict, nullable=False)


class FeedLog(Base):
    __tablename__ = "feed_logs"
    __table_args__ = (Index("ix_feed_logs_feed_created", "feed_id", "created_at"),)

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    feed_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    level: Mapped[str] = mapped_column(String(20), nullable=False, index=True)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    event_type: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    metadata_: Mapped[dict[str, Any]] = mapped_column("metadata", JSON, default=dict, nullable=False)


class ConnectorStatus(Base):
    __tablename__ = "connector_status"

    connector_type: Mapped[str] = mapped_column(String(80), primary_key=True)
    status: Mapped[str] = mapped_column(String(40), default="unknown", nullable=False)
    last_checked_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    consecutive_failures: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    circuit_open_until: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    metadata_: Mapped[dict[str, Any]] = mapped_column("metadata", JSON, default=dict, nullable=False)


class APIUsageStatistic(Base):
    __tablename__ = "api_usage_statistics"
    __table_args__ = (Index("ix_api_usage_connector_window", "connector_type", "window_started_at"),)

    id: Mapped[str] = mapped_column(String(64), primary_key=True, index=True)
    connector_type: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    window_started_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    requests_made: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    records_received: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    errors: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
