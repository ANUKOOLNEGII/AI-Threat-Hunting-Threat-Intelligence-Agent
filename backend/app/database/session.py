from __future__ import annotations

from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.auth.models.audit_log import Base as AuditLogBase
from app.auth.models.refresh_token import Base as RefreshTokenBase
from app.auth.models.user import Base as UserBase
from app.ai.models import AIConversation
from app.core.config import get_settings
from app.feeds.models import ThreatFeed
from app.threat_intel.models import Base as ThreatIntelBase
from app.reporting.models import Base as ReportingBase
from app.notifications.models import Base as NotificationsBase

settings = get_settings()

# Configure connection pooling for production performance
engine = create_async_engine(
    settings.postgres_dsn or "sqlite+aiosqlite:///./app.db",
    echo=False,
    pool_size=20,  # Increased connection pool size
    max_overflow=40,  # Allow additional connections during peak load
    pool_pre_ping=True,  # Verify connections before use
    pool_recycle=3600,  # Recycle connections after 1 hour
    connect_args={
        "connect_timeout": 10,
        "command_timeout": 30,
    } if settings.postgres_dsn else {},
)

SessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False, class_=AsyncSession)

_db_initialized = False


async def init_db() -> None:
    """Initialize database. In production, use Alembic migrations instead."""
    global _db_initialized
    if _db_initialized:
        return
    
    # For development, create tables if they don't exist
    # In production, run: alembic upgrade head
    async with engine.begin() as conn:
        # Check if tables exist, if not create them (dev mode)
        # Production should use Alembic migrations
        await conn.run_sync(UserBase.metadata.create_all, checkfirst=True)
        await conn.run_sync(RefreshTokenBase.metadata.create_all, checkfirst=True)
        await conn.run_sync(AuditLogBase.metadata.create_all, checkfirst=True)
        await conn.run_sync(ThreatIntelBase.metadata.create_all, checkfirst=True)
        await conn.run_sync(ReportingBase.metadata.create_all, checkfirst=True)
        await conn.run_sync(NotificationsBase.metadata.create_all, checkfirst=True)
    
    _db_initialized = True


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with SessionLocal() as session:
        yield session
