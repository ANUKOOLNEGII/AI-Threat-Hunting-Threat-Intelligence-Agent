from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Optional

from sqlalchemy import Select, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.threat_intel.models.threat import Threat
from app.threat_intel.schemas.threat import ThreatCreate, ThreatUpdate


SORT_COLUMNS = {
    "publishedAt": Threat.published_at,
    "updatedAt": Threat.updated_at,
    "severity": Threat.severity,
    "title": Threat.title,
}


class ThreatRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    def _apply_filters(
        self,
        stmt: Select[tuple[Threat]],
        *,
        query: Optional[str],
        severity: Optional[str],
        category: Optional[str],
        status: Optional[str],
        source: Optional[str],
    ) -> Select[tuple[Threat]]:
        if query:
            like = f"%{query.lower()}%"
            stmt = stmt.where(or_(func.lower(Threat.title).like(like), func.lower(Threat.summary).like(like), func.lower(Threat.source_name).like(like)))
        if severity and severity != "all":
            stmt = stmt.where(Threat.severity == severity)
        if category and category != "all":
            stmt = stmt.where(Threat.category == category)
        if status and status != "all":
            stmt = stmt.where(Threat.status == status)
        if source and source != "all":
            stmt = stmt.where(func.lower(Threat.source_name) == source.lower())
        return stmt

    async def list(
        self,
        *,
        query: Optional[str],
        severity: Optional[str],
        category: Optional[str],
        status: Optional[str],
        source: Optional[str],
        page: int,
        page_size: int,
        sort_by: str,
        sort_dir: str,
    ) -> tuple[list[Threat], int]:
        base = self._apply_filters(select(Threat), query=query, severity=severity, category=category, status=status, source=source)
        total_stmt = select(func.count()).select_from(self._apply_filters(select(Threat).subquery(), query=None, severity=None, category=None, status=None, source=None))
        total_stmt = select(func.count()).select_from(self._apply_filters(select(Threat), query=query, severity=severity, category=category, status=status, source=source).subquery())
        total = int((await self.session.execute(total_stmt)).scalar_one())
        column = SORT_COLUMNS.get(sort_by, Threat.published_at)
        base = base.order_by(column.asc() if sort_dir == "asc" else column.desc()).offset((page - 1) * page_size).limit(page_size)
        return list((await self.session.execute(base)).scalars().all()), total

    async def get(self, threat_id: str) -> Optional[Threat]:
        result = await self.session.execute(select(Threat).where(Threat.id == threat_id))
        return result.scalar_one_or_none()

    async def create(self, payload: ThreatCreate) -> Threat:
        now = datetime.utcnow()
        threat = Threat(
            id=payload.id or f"threat-{uuid.uuid4().hex[:12]}",
            title=payload.title,
            summary=payload.summary,
            category=payload.category,
            severity=payload.severity,
            status=payload.status,
            source_name=payload.source.name,
            source_type=payload.source.type,
            source_url=payload.source.url,
            published_at=payload.publishedAt.replace(tzinfo=None),
            updated_at=(payload.updatedAt or now).replace(tzinfo=None),
            tags=[item.model_dump() for item in payload.tags],
            description=payload.description,
            affected_vendor=payload.affectedVendor,
            affected_product=payload.affectedProduct,
            cvss_score=payload.cvssScore,
            reference_ids=payload.referenceIds,
            timeline=[item.model_dump(mode="json") for item in payload.timeline],
            ioc_refs=[item.model_dump() for item in payload.iocRefs],
            related_threats=[item.model_dump(mode="json") for item in payload.relatedThreats],
            references=payload.references,
            metadata_=payload.metadata,
        )
        self.session.add(threat)
        await self.session.commit()
        await self.session.refresh(threat)
        return threat

    async def update(self, threat: Threat, payload: ThreatUpdate) -> Threat:
        data = payload.model_dump(exclude_unset=True)
        if source := data.pop("source", None):
            threat.source_name = source["name"]
            threat.source_type = source["type"]
            threat.source_url = source.get("url")
        mapping = {
            "publishedAt": "published_at",
            "updatedAt": "updated_at",
            "affectedVendor": "affected_vendor",
            "affectedProduct": "affected_product",
            "cvssScore": "cvss_score",
            "referenceIds": "reference_ids",
            "iocRefs": "ioc_refs",
            "relatedThreats": "related_threats",
            "metadata": "metadata_",
        }
        for key, value in data.items():
            attr = mapping.get(key, key)
            if isinstance(value, datetime):
                value = value.replace(tzinfo=None)
            elif key in {"tags", "timeline", "iocRefs", "relatedThreats"}:
                value = [item.model_dump(mode="json") if hasattr(item, "model_dump") else item for item in value]
            setattr(threat, attr, value)
        threat.updated_at = data.get("updatedAt", datetime.utcnow()).replace(tzinfo=None) if isinstance(data.get("updatedAt", datetime.utcnow()), datetime) else datetime.utcnow()
        await self.session.commit()
        await self.session.refresh(threat)
        return threat

    async def delete(self, threat: Threat) -> None:
        await self.session.delete(threat)
        await self.session.commit()

    async def counts_by(self, column_name: str) -> list[tuple[str, int]]:
        column = getattr(Threat, column_name)
        rows = await self.session.execute(select(column, func.count()).group_by(column))
        return [(str(name), int(count)) for name, count in rows.all()]

    async def recent(self, limit: int = 5) -> list[Threat]:
        result = await self.session.execute(select(Threat).order_by(Threat.updated_at.desc()).limit(limit))
        return list(result.scalars().all())
