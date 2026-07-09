from __future__ import annotations

from typing import Any, Optional

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.repositories.user_repository import UserRepository
from app.threat_intel.cache.dashboard_cache import dashboard_cache
from app.threat_intel.models.cve import CVE
from app.threat_intel.repositories.cve_repository import CVERepository
from app.threat_intel.schemas.cve import CVECreate, CVEUpdate


class CVEService:
    def __init__(self, session: AsyncSession) -> None:
        self.repository = CVERepository(session)
        self.audit = UserRepository(session)

    def serialize(self, cve: CVE) -> dict[str, Any]:
        return {
            "cveId": cve.cve_id,
            "title": cve.title,
            "description": cve.description,
            "vendor": cve.vendor,
            "product": cve.product,
            "cvssScore": cve.cvss_score,
            "severity": cve.severity,
            "isExploited": cve.is_exploited,
            "status": cve.status,
            "publishedDate": cve.published_date.isoformat(),
            "updatedDate": cve.updated_date.isoformat(),
            "cvssMetrics": cve.cvss_metrics or {},
            "detectionRules": cve.detection_rules or [],
            "mitigation": cve.mitigation or {},
            "mitreAttack": cve.mitre_attack or [],
            "references": cve.references or [],
            "relatedCves": cve.related_cves or [],
            "metadata": cve.metadata_ or {},
        }

    async def list(self, **kwargs: Any) -> dict[str, Any]:
        items, total = await self.repository.list(**kwargs)
        return {"items": [self.serialize(item) for item in items], "total": total, "page": kwargs["page"], "pageSize": kwargs["page_size"]}

    async def get(self, cve_id: str) -> dict[str, Any]:
        cve = await self.repository.get(cve_id)
        if not cve:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="CVE not found")
        return self.serialize(cve)

    async def create(self, payload: CVECreate, user_id: Optional[str]) -> dict[str, Any]:
        if await self.repository.get(payload.cveId):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="CVE already exists")
        cve = await self.repository.create(payload)
        if user_id:
            await self.audit.create_audit_log(user_id, "cve.create", cve.cve_id)
        await dashboard_cache.clear()
        return self.serialize(cve)

    async def update(self, cve_id: str, payload: CVEUpdate, user_id: Optional[str]) -> dict[str, Any]:
        cve = await self.repository.get(cve_id)
        if not cve:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="CVE not found")
        cve = await self.repository.update(cve, payload)
        if user_id:
            await self.audit.create_audit_log(user_id, "cve.update", cve.cve_id)
        await dashboard_cache.clear()
        return self.serialize(cve)

    async def delete(self, cve_id: str, user_id: Optional[str]) -> None:
        cve = await self.repository.get(cve_id)
        if not cve:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="CVE not found")
        await self.repository.delete(cve)
        if user_id:
            await self.audit.create_audit_log(user_id, "cve.delete", cve_id)
        await dashboard_cache.clear()
