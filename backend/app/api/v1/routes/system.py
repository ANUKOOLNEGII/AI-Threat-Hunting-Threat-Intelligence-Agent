from fastapi import APIRouter

from app.core.config import get_settings
from app.database.connection import connection_manager

router = APIRouter(tags=["system"])


@router.get("/system/info")
async def system_info() -> dict[str, object]:
    settings = get_settings()
    return {
        "service": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
        "debug": settings.debug,
    }


@router.get("/system/dependencies")
async def dependency_status() -> dict[str, object]:
    return await connection_manager.health()
