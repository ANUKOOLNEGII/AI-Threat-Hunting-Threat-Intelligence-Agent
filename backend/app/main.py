from __future__ import annotations

from contextlib import asynccontextmanager
from typing import AsyncIterator

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.routes.health import router as health_router
from app.api.v1.routes.system import router as system_router
from app.ai.routes import ai_router
from app.auth.middleware.auth import get_current_user
from app.auth.routes.auth import router as auth_router
from app.auth.services.auth_service import AuthService
from app.core.config import get_settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import configure_logging, get_logger
from app.database.connection import connection_manager
from app.database.session import get_session, init_db
from app.feeds.routes import feeds_router, scheduler_router
from app.middleware.request_id import RequestIDMiddleware
from app.middleware.security import SecurityHeadersMiddleware
from app.reporting.routes import router as reporting_router
from app.notifications.routes import router as notifications_router
from app.websockets.routes import router as websocket_router
from app.admin.routes import router as admin_router
from app.monitoring.routes import router as monitoring_router
from app.threat_intel.routes import cves_router, dashboard_router, iocs_router, threats_router

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    settings = get_settings()
    configure_logging()
    logger.info("Starting %s %s", settings.app_name, settings.app_version)
    await connection_manager.initialize()
    await init_db()
    logger.info("Initialization complete")
    yield
    logger.info("Shutting down %s", settings.app_name)


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.app_name.replace("-", " ").title(),
        version=settings.app_version,
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    register_exception_handlers(app)
    app.add_middleware(RequestIDMiddleware)
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_allow_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health_router)
    app.include_router(health_router, prefix="/api/v1")
    app.include_router(system_router)
    app.include_router(system_router, prefix="/api/v1")
    app.include_router(auth_router)
    app.include_router(auth_router, prefix="/api/v1")
    for router in (dashboard_router, threats_router, cves_router, iocs_router):
        app.include_router(router)
        app.include_router(router, prefix="/api/v1")
    for router in (feeds_router, scheduler_router):
        app.include_router(router)
        app.include_router(router, prefix="/api/v1")
    app.include_router(ai_router)
    app.include_router(ai_router, prefix="/api/v1")
    app.include_router(reporting_router)
    app.include_router(reporting_router, prefix="/api/v1")
    app.include_router(notifications_router)
    app.include_router(notifications_router, prefix="/api/v1")
    app.include_router(websocket_router)
    app.include_router(websocket_router, prefix="/api/v1")
    app.include_router(admin_router)
    app.include_router(admin_router, prefix="/api/v1")
    app.include_router(monitoring_router)
    app.include_router(monitoring_router, prefix="/api/v1")

    @app.get("/")
    async def home() -> dict[str, str]:
        return {"message": "AI Threat Hunting & Threat Intelligence Agent API"}

    @app.get("/users/profile")
    async def profile_root(session: AsyncSession = Depends(get_session), user=Depends(get_current_user)) -> dict[str, object]:
        service = AuthService(session)
        return await service.get_profile(user.id)

    return app


app = create_app()
