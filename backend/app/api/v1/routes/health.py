from fastapi import APIRouter, Request

from app.core.config import get_settings
from app.database.connection import connection_manager
from app.schemas.base import HealthStatus
from app.utils.constants import HEALTH_DETAILED_ROUTE, HEALTH_ROUTE

router = APIRouter(tags=["health"])


@router.get(HEALTH_ROUTE, response_model=HealthStatus)
@router.get(f"/api/v1{HEALTH_ROUTE}", response_model=HealthStatus)
async def health(request: Request) -> dict[str, object]:
    settings = get_settings()
    return {
        "status": "ok",
        "service": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
        "dependencies": {
            "postgres": "configured" if settings.postgres_dsn else "not-configured",
            "mongodb": "configured" if settings.mongodb_dsn else "not-configured",
            "redis": "configured" if settings.redis_url else "not-configured",
            "chroma": "configured" if settings.chroma_host else "not-configured",
        },
    }


@router.get(HEALTH_DETAILED_ROUTE, response_model=HealthStatus)
@router.get(f"/api/v1{HEALTH_DETAILED_ROUTE}", response_model=HealthStatus)
async def detailed_health(request: Request) -> dict[str, object]:
    settings = get_settings()
    dependency_state = await connection_manager.health()
    return {
        "status": "ok",
        "service": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
        "dependencies": dependency_state,
    }
