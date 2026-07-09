from __future__ import annotations

import uuid
from typing import Optional

from sqlalchemy import Select, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.threat_intel.models.ioc import IOC
from app.threat_intel.schemas.ioc import IOCCreate, IOCUpdate


SORT_COLUMNS = {
    "value": IOC.value,
    "reputation": IOC.reputation,
    "confidence": IOC.confidence,
    "lastSeen": IOC.last_seen,
}


class IOCRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    def _filters(self, stmt: Select[tuple[IOC]], query: Optional[str], type_: Optional[str], reputation: Optional[str], status: Optional[str]) -> Select[tuple[IOC]]:
        if query:
            like = f"%{query.lower()}%"
            stmt = stmt.where(or_(func.lower(IOC.value).like(like), func.lower(IOC.source).like(like), func.lower(IOC.description).like(like)))
        if type_ and type_ != "all":
            stmt = stmt.where(IOC.type == type_)
        if reputation and reputation != "all":
            stmt = stmt.where(IOC.reputation == reputation)
        if status and status != "all":
            stmt = stmt.where(IOC.status == status)
        return stmt

    async def list(self, *, query: Optional[str], type_: Optional[str], reputation: Optional[str], status: Optional[str], page: int, page_size: int, sort_by: str, sort_dir: str) -> tuple[list[IOC], int]:
        stmt = self._filters(select(IOC), query, type_, reputation, status)
        total = int((await self.session.execute(select(func.count()).select_from(stmt.subquery()))).scalar_one())
        column = SORT_COLUMNS.get(sort_by, IOC.last_seen)
        stmt = stmt.order_by(column.asc() if sort_dir == "asc" else column.desc()).offset((page - 1) * page_size).limit(page_size)
        return list((await self.session.execute(stmt)).scalars().all()), total

    async def get(self, ioc_id: str) -> Optional[IOC]:
        result = await self.session.execute(select(IOC).where(IOC.id == ioc_id))
        return result.scalar_one_or_none()

    async def get_by_value(self, value: str) -> Optional[IOC]:
        result = await self.session.execute(select(IOC).where(func.lower(IOC.value) == value.lower()))
        return result.scalar_one_or_none()

    async def create(self, payload: IOCCreate) -> IOC:
        ioc = IOC(
            id=payload.id or f"ioc-{uuid.uuid4().hex[:12]}",
            value=payload.value,
            type=payload.type,
            reputation=payload.reputation,
            confidence=payload.confidence,
            source=payload.source,
            threat_count=payload.threatCount,
            first_seen=payload.firstSeen.replace(tzinfo=None),
            last_seen=payload.lastSeen.replace(tzinfo=None),
            status=payload.status,
            description=payload.description,
            whois=payload.whois,
            timeline=payload.timeline,
            relationships=payload.relationships,
            external_intel=payload.externalIntel,
            metadata_=payload.metadata,
        )
        self.session.add(ioc)
        await self.session.commit()
        await self.session.refresh(ioc)
        return ioc

    async def update(self, ioc: IOC, payload: IOCUpdate) -> IOC:
        mapping = {"threatCount": "threat_count", "firstSeen": "first_seen", "lastSeen": "last_seen", "externalIntel": "external_intel", "metadata": "metadata_"}
        for key, value in payload.model_dump(exclude_unset=True).items():
            attr = mapping.get(key, key)
            if key in {"firstSeen", "lastSeen"}:
                value = value.replace(tzinfo=None)
            setattr(ioc, attr, value)
        await self.session.commit()
        await self.session.refresh(ioc)
        return ioc

    async def delete(self, ioc: IOC) -> None:
        await self.session.delete(ioc)
        await self.session.commit()
