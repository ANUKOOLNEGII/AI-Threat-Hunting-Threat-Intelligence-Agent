from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
import time
import psutil
from ..database.session import get_session
from ..auth.middleware.auth import get_current_user, require_roles
from ..core.config import get_settings
from .schemas import (
    SystemHealthResponse,
    DatabaseHealthResponse,
    ServiceHealthResponse,
    ResourceUsageResponse,
    MetricsResponse,
)

router = APIRouter()
start_time = time.time()


@router.get("/monitoring/system-health", response_model=SystemHealthResponse)
async def get_system_health(
    current_user=Depends(get_current_user),
):
    settings = get_settings()
    uptime = time.time() - start_time
    return SystemHealthResponse(
        status="healthy",
        timestamp=datetime.utcnow(),
        version=settings.app_version,
        uptime_seconds=uptime,
    )


@router.get("/monitoring/database-health", response_model=DatabaseHealthResponse)
async def get_database_health(
    db: AsyncSession = Depends(get_session),
    current_user=Depends(require_roles("admin", "analyst")),
):
    # Check SQLite/Postgres health
    try:
        await db.execute("SELECT 1")
        db_status = {"status": "healthy"}
    except Exception as e:
        db_status = {"status": "unhealthy", "error": str(e)}
    
    return DatabaseHealthResponse(
        sqlite=db_status,
        postgres=db_status,
    )


@router.get("/monitoring/resource-usage", response_model=ResourceUsageResponse)
async def get_resource_usage(
    current_user=Depends(require_roles("admin", "analyst")),
):
    cpu_percent = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage("/")
    
    return ResourceUsageResponse(
        cpu_percent=cpu_percent,
        memory_percent=memory.percent,
        disk_percent=disk.percent,
        disk_usage_gb=disk.used / (1024**3),
        disk_total_gb=disk.total / (1024**3),
    )


@router.get("/monitoring/metrics", response_model=MetricsResponse)
async def get_all_metrics(
    db: AsyncSession = Depends(get_session),
    current_user=Depends(require_roles("admin", "analyst")),
):
    settings = get_settings()
    uptime = time.time() - start_time
    
    # System health
    system = SystemHealthResponse(
        status="healthy",
        timestamp=datetime.utcnow(),
        version=settings.app_version,
        uptime_seconds=uptime,
    )
    
    # Database health
    try:
        await db.execute("SELECT 1")
        db_status = {"status": "healthy"}
    except Exception as e:
        db_status = {"status": "unhealthy", "error": str(e)}
    
    databases = DatabaseHealthResponse(
        sqlite=db_status,
        postgres=db_status,
    )
    
    # Service health
    services = ServiceHealthResponse(
        api={"status": "healthy"},
    )
    
    # Resource usage
    cpu_percent = psutil.cpu_percent(interval=0.1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage("/")
    resources = ResourceUsageResponse(
        cpu_percent=cpu_percent,
        memory_percent=memory.percent,
        disk_percent=disk.percent,
        disk_usage_gb=disk.used / (1024**3),
        disk_total_gb=disk.total / (1024**3),
    )
    
    return MetricsResponse(
        system=system,
        databases=databases,
        services=services,
        resources=resources,
    )
