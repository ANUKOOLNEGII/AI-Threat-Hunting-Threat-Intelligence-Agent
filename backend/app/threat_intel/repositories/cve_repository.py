from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy import Select, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.threat_intel.models.cve import CVE
from app.threat_intel.schemas.cve import CVECreate, CVEUpdate


SORT_COLUMNS = {
    "cveId": CVE.cve_id,
    "cvssScore": CVE.cvss_score,
    "publishedDate": CVE.published_date,
    "updatedDate": CVE.updated_date,
}


class CVERepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    def _filters(self, stmt: Select[tuple[CVE]], query: Optional[str], severity: Optional[str], vendor: Optional[str], product: Optional[str], status: Optional[str], exploited: Optional[str], min_cvss: Optional[float], max_cvss: Optional[float]) -> Select[tuple[CVE]]:
        if query:
            like = f"%{query.lower()}%"
            stmt = stmt.where(or_(func.lower(CVE.cve_id).like(like), func.lower(CVE.title).like(like), func.lower(CVE.description).like(like), func.lower(CVE.vendor).like(like), func.lower(CVE.product).like(like)))
        if severity and severity != "all":
            stmt = stmt.where(CVE.severity == severity)
        if vendor:
            stmt = stmt.where(func.lower(CVE.vendor).like(f"%{vendor.lower()}%"))
        if product:
            stmt = stmt.where(func.lower(CVE.product).like(f"%{product.lower()}%"))
        if status and status != "all":
            stmt = stmt.where(CVE.status == status)
        if exploited not in (None, "all"):
            stmt = stmt.where(CVE.is_exploited.is_(str(exploited).lower() == "true"))
        if min_cvss is not None:
            stmt = stmt.where(CVE.cvss_score >= min_cvss)
        if max_cvss is not None:
            stmt = stmt.where(CVE.cvss_score <= max_cvss)
        return stmt

    async def list(self, *, query: Optional[str], severity: Optional[str], vendor: Optional[str], product: Optional[str], status: Optional[str], exploited: Optional[str], min_cvss: Optional[float], max_cvss: Optional[float], page: int, page_size: int, sort_by: str, sort_dir: str) -> tuple[list[CVE], int]:
        stmt = self._filters(select(CVE), query, severity, vendor, product, status, exploited, min_cvss, max_cvss)
        total = int((await self.session.execute(select(func.count()).select_from(stmt.subquery()))).scalar_one())
        column = SORT_COLUMNS.get(sort_by, CVE.published_date)
        stmt = stmt.order_by(column.asc() if sort_dir == "asc" else column.desc()).offset((page - 1) * page_size).limit(page_size)
        return list((await self.session.execute(stmt)).scalars().all()), total

    async def get(self, cve_id: str) -> Optional[CVE]:
        result = await self.session.execute(select(CVE).where(CVE.cve_id == cve_id))
        return result.scalar_one_or_none()

    async def create(self, payload: CVECreate) -> CVE:
        now = datetime.utcnow()
        cve = CVE(
            cve_id=payload.cveId,
            title=payload.title,
            description=payload.description,
            vendor=payload.vendor,
            product=payload.product,
            cvss_score=payload.cvssScore,
            severity=payload.severity,
            is_exploited=payload.isExploited,
            status=payload.status,
            published_date=payload.publishedDate.replace(tzinfo=None),
            updated_date=(payload.updatedDate or now).replace(tzinfo=None),
            cvss_metrics=payload.cvssMetrics,
            detection_rules=payload.detectionRules,
            mitigation=payload.mitigation,
            mitre_attack=payload.mitreAttack,
            references=[item.model_dump() for item in payload.references],
            related_cves=payload.relatedCves,
            metadata_=payload.metadata,
        )
        self.session.add(cve)
        await self.session.commit()
        await self.session.refresh(cve)
        return cve

    async def update(self, cve: CVE, payload: CVEUpdate) -> CVE:
        mapping = {"cvssScore": "cvss_score", "isExploited": "is_exploited", "publishedDate": "published_date", "updatedDate": "updated_date", "cvssMetrics": "cvss_metrics", "detectionRules": "detection_rules", "mitreAttack": "mitre_attack", "relatedCves": "related_cves", "metadata": "metadata_"}
        for key, value in payload.model_dump(exclude_unset=True).items():
            attr = mapping.get(key, key)
            if isinstance(value, datetime):
                value = value.replace(tzinfo=None)
            setattr(cve, attr, value)
        cve.updated_date = datetime.utcnow()
        await self.session.commit()
        await self.session.refresh(cve)
        return cve

    async def delete(self, cve: CVE) -> None:
        await self.session.delete(cve)
        await self.session.commit()
