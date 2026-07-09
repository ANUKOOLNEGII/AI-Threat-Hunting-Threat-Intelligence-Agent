from __future__ import annotations

from typing import Any, Optional

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.repositories.user_repository import UserRepository
from app.threat_intel.cache.dashboard_cache import dashboard_cache
from app.threat_intel.models.ioc import IOC
from app.threat_intel.repositories.ioc_repository import IOCRepository
from app.threat_intel.schemas.ioc import IOCCreate, IOCUpdate


class IOCService:
    def __init__(self, session: AsyncSession) -> None:
        self.repository = IOCRepository(session)
        self.audit = UserRepository(session)

    def serialize(self, ioc: IOC) -> dict[str, Any]:
        return {
            "id": ioc.id,
            "value": ioc.value,
            "type": ioc.type,
            "reputation": ioc.reputation,
            "confidence": ioc.confidence,
            "source": ioc.source,
            "threatCount": ioc.threat_count,
            "firstSeen": ioc.first_seen.isoformat(),
            "lastSeen": ioc.last_seen.isoformat(),
            "status": ioc.status,
            "description": ioc.description,
            "whois": ioc.whois or {},
            "timeline": ioc.timeline or [],
            "relationships": ioc.relationships or [],
            "externalIntel": ioc.external_intel or [],
            "metadata": ioc.metadata_ or {},
        }

    async def list(self, **kwargs: Any) -> dict[str, Any]:
        items, total = await self.repository.list(**kwargs)
        return {"items": [self.serialize(item) for item in items], "total": total, "page": kwargs["page"], "pageSize": kwargs["page_size"]}

    async def get(self, ioc_id: str) -> dict[str, Any]:
        ioc = await self.repository.get(ioc_id)
        if not ioc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="IOC not found")
        return self.serialize(ioc)

    async def create(self, payload: IOCCreate, user_id: Optional[str]) -> dict[str, Any]:
        ioc = await self.repository.create(payload)
        if user_id:
            await self.audit.create_audit_log(user_id, "ioc.create", ioc.id)
        await dashboard_cache.clear()
        return self.serialize(ioc)

    async def update(self, ioc_id: str, payload: IOCUpdate, user_id: Optional[str]) -> dict[str, Any]:
        ioc = await self.repository.get(ioc_id)
        if not ioc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="IOC not found")
        ioc = await self.repository.update(ioc, payload)
        if user_id:
            await self.audit.create_audit_log(user_id, "ioc.update", ioc.id)
        await dashboard_cache.clear()
        return self.serialize(ioc)

    async def delete(self, ioc_id: str, user_id: Optional[str]) -> None:
        ioc = await self.repository.get(ioc_id)
        if not ioc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="IOC not found")
        await self.repository.delete(ioc)
        if user_id:
            await self.audit.create_audit_log(user_id, "ioc.delete", ioc_id)
        await dashboard_cache.clear()
