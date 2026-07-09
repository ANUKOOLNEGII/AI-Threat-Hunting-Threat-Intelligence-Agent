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

settings = get_settings()

engine = create_async_engine(
    settings.postgres_dsn or "sqlite+aiosqlite:///./app.db",
    echo=False,
)

SessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False)


async def init_db() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(UserBase.metadata.create_all)
        await conn.run_sync(RefreshTokenBase.metadata.create_all)
        await conn.run_sync(AuditLogBase.metadata.create_all)
        await conn.run_sync(ThreatIntelBase.metadata.create_all)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    await init_db()
    async with SessionLocal() as session:
        yield session
