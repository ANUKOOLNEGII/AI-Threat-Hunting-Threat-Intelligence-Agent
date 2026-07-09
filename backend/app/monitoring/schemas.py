from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class SystemHealthResponse(BaseModel):
    status: str
    timestamp: datetime
    version: str
    uptime_seconds: float


class DatabaseHealthResponse(BaseModel):
    postgres: Optional[Dict[str, Any]] = None
    sqlite: Optional[Dict[str, Any]] = None
    redis: Optional[Dict[str, Any]] = None
    mongodb: Optional[Dict[str, Any]] = None
    chromadb: Optional[Dict[str, Any]] = None


class ServiceHealthResponse(BaseModel):
    api: Dict[str, Any]
    celery_workers: Optional[Dict[str, Any]] = None
    groq: Optional[Dict[str, Any]] = None
    threat_feeds: Optional[Dict[str, Any]] = None


class ResourceUsageResponse(BaseModel):
    cpu_percent: float
    memory_percent: float
    disk_percent: float
    disk_usage_gb: float
    disk_total_gb: float


class MetricsResponse(BaseModel):
    system: SystemHealthResponse
    databases: DatabaseHealthResponse
    services: ServiceHealthResponse
    resources: ResourceUsageResponse
