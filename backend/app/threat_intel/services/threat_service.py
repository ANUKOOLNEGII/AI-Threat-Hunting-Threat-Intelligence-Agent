from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.repositories.user_repository import UserRepository
from app.threat_intel.cache.dashboard_cache import dashboard_cache
from app.threat_intel.models.threat import Threat
from app.threat_intel.repositories.threat_repository import ThreatRepository
from app.threat_intel.schemas.threat import ThreatCreate, ThreatUpdate


class ThreatService:
    def __init__(self, session: AsyncSession) -> None:
        self.repository = ThreatRepository(session)
        self.audit = UserRepository(session)

    def serialize(self, threat: Threat) -> dict[str, Any]:
        return {
            "id": threat.id,
            "title": threat.title,
            "summary": threat.summary,
            "category": threat.category,
            "severity": threat.severity,
            "status": threat.status,
            "source": {"name": threat.source_name, "type": threat.source_type, "url": threat.source_url},
            "publishedAt": threat.published_at.isoformat(),
            "updatedAt": threat.updated_at.isoformat(),
            "tags": threat.tags or [],
            "description": threat.description,
            "affectedVendor": threat.affected_vendor,
            "affectedProduct": threat.affected_product,
            "cvssScore": threat.cvss_score,
            "referenceIds": threat.reference_ids or [],
            "timeline": threat.timeline or [],
            "iocRefs": threat.ioc_refs or [],
            "relatedThreats": threat.related_threats or [],
            "references": threat.references or [],
            "metadata": threat.metadata_ or {},
        }

    async def list(self, **kwargs: Any) -> dict[str, Any]:
        items, total = await self.repository.list(**kwargs)
        return {"items": [self.serialize(item) for item in items], "total": total, "page": kwargs["page"], "pageSize": kwargs["page_size"]}

    async def get(self, threat_id: str) -> dict[str, Any]:
        threat = await self.repository.get(threat_id)
        if not threat:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Threat not found")
        return self.serialize(threat)

    async def create(self, payload: ThreatCreate, user_id: Optional[str]) -> dict[str, Any]:
        threat = await self.repository.create(payload)
        if user_id:
            await self.audit.create_audit_log(user_id, "threat.create", threat.id)
        await dashboard_cache.clear()
        return self.serialize(threat)

    async def update(self, threat_id: str, payload: ThreatUpdate, user_id: Optional[str]) -> dict[str, Any]:
        threat = await self.repository.get(threat_id)
        if not threat:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Threat not found")
        threat = await self.repository.update(threat, payload)
        if user_id:
            await self.audit.create_audit_log(user_id, "threat.update", threat.id)
        await dashboard_cache.clear()
        return self.serialize(threat)

    async def delete(self, threat_id: str, user_id: Optional[str]) -> None:
        threat = await self.repository.get(threat_id)
        if not threat:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Threat not found")
        await self.repository.delete(threat)
        if user_id:
            await self.audit.create_audit_log(user_id, "threat.delete", threat_id)
        await dashboard_cache.clear()
