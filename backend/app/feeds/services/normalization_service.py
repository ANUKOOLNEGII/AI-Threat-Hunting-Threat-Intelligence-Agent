from __future__ import annotations

import hashlib
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Optional

from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from app.threat_intel.repositories.cve_repository import CVERepository
from app.threat_intel.repositories.ioc_repository import IOCRepository
from app.threat_intel.repositories.threat_repository import ThreatRepository
from app.threat_intel.schemas.cve import CVECreate, CVEUpdate
from app.threat_intel.schemas.ioc import IOCCreate, IOCUpdate
from app.threat_intel.schemas.threat import ThreatCreate, ThreatUpdate


@dataclass
class NormalizationResult:
    received: int = 0
    created: int = 0
    updated: int = 0
    rejected: int = 0
    errors: list[str] = field(default_factory=list)


class NormalizationService:
    def __init__(self, session: AsyncSession) -> None:
        self.threats = ThreatRepository(session)
        self.cves = CVERepository(session)
        self.iocs = IOCRepository(session)

    def parse_datetime(self, value: Any) -> datetime:
        if isinstance(value, datetime):
            return value
        if isinstance(value, str) and value:
            normalized = value.replace("Z", "+00:00")
            try:
                return datetime.fromisoformat(normalized).replace(tzinfo=None)
            except ValueError:
                pass
            try:
                return datetime.strptime(value[:10], "%Y-%m-%d")
            except ValueError:
                pass
        return datetime.utcnow()

    def normalize_severity(self, value: Any, cvss_score: Optional[float] = None) -> str:
        severity = str(value or "").strip().lower()
        aliases = {"critical": "critical", "high": "high", "medium": "medium", "moderate": "medium", "low": "low", "info": "informational", "informational": "informational", "none": "informational"}
        if severity in aliases:
            return aliases[severity]
        if cvss_score is not None:
            if cvss_score >= 9:
                return "critical"
            if cvss_score >= 7:
                return "high"
            if cvss_score >= 4:
                return "medium"
            if cvss_score > 0:
                return "low"
        return "informational"

    def normalize_category(self, value: Any) -> str:
        category = str(value or "advisory").strip().lower().replace("_", "-")
        allowed = {"vulnerability", "campaign", "malware", "ransomware", "phishing", "data-breach", "apt", "zero-day", "advisory"}
        return category if category in allowed else "advisory"

    def stable_id(self, prefix: str, source: str, value: str) -> str:
        digest = hashlib.sha256(f"{source}:{value}".encode("utf-8")).hexdigest()[:16]
        return f"{prefix}-{digest}"

    async def ingest_records(self, records: list[dict[str, Any]], *, feed_id: str, provider: str) -> NormalizationResult:
        result = NormalizationResult(received=len(records))
        seen: set[str] = set()
        for record in records:
            try:
                record_type = str(record.get("record_type") or record.get("type") or "threat").lower()
                dedupe_key = f"{record_type}:{record.get('external_id') or record.get('cve_id') or record.get('value') or record.get('title')}"
                if dedupe_key in seen:
                    result.updated += 0
                    continue
                seen.add(dedupe_key)
                if record_type == "cve":
                    created = await self._upsert_cve(record, feed_id=feed_id, provider=provider)
                elif record_type == "ioc":
                    created = await self._upsert_ioc(record, feed_id=feed_id, provider=provider)
                else:
                    created = await self._upsert_threat(record, feed_id=feed_id, provider=provider)
                if created:
                    result.created += 1
                else:
                    result.updated += 1
            except (ValidationError, ValueError, KeyError) as exc:
                result.rejected += 1
                result.errors.append(str(exc))
        return result

    async def _upsert_threat(self, record: dict[str, Any], *, feed_id: str, provider: str) -> bool:
        title = str(record.get("title") or "").strip()
        if not title:
            raise ValueError("Threat title is required")
        threat_id = str(record.get("id") or self.stable_id("threat", provider, str(record.get("external_id") or title)))
        published = self.parse_datetime(record.get("published_at") or record.get("publishedAt"))
        updated = self.parse_datetime(record.get("updated_at") or record.get("updatedAt") or published)
        source = record.get("source") or {"name": provider, "type": "community", "url": record.get("url")}
        payload = ThreatCreate(
            id=threat_id,
            title=title,
            summary=str(record.get("summary") or record.get("description") or title),
            category=self.normalize_category(record.get("category")),
            severity=self.normalize_severity(record.get("severity"), record.get("cvss_score")),
            status=str(record.get("status") or "active").lower(),
            source=source,
            publishedAt=published,
            updatedAt=updated,
            tags=record.get("tags") or [{"id": feed_id, "label": provider, "color": "blue"}],
            description=record.get("description"),
            affectedVendor=record.get("affected_vendor"),
            affectedProduct=record.get("affected_product"),
            cvssScore=record.get("cvss_score"),
            referenceIds=record.get("reference_ids") or [],
            timeline=record.get("timeline") or [],
            iocRefs=record.get("ioc_refs") or [],
            references=record.get("references") or [],
            metadata={**(record.get("metadata") or {}), "feedId": feed_id, "provider": provider},
        )
        existing = await self.threats.get(threat_id)
        if existing:
            await self.threats.update(existing, ThreatUpdate(**payload.model_dump(exclude={"id"})))
            return False
        await self.threats.create(payload)
        return True

    async def _upsert_cve(self, record: dict[str, Any], *, feed_id: str, provider: str) -> bool:
        cve_id = str(record.get("cve_id") or record.get("cveId") or "").upper()
        if not cve_id.startswith("CVE-"):
            raise ValueError("Valid CVE ID is required")
        score = float(record.get("cvss_score") or record.get("cvssScore") or 0)
        payload = CVECreate(
            cveId=cve_id,
            title=str(record.get("title") or cve_id),
            description=str(record.get("description") or record.get("summary") or cve_id),
            vendor=str(record.get("vendor") or "Unknown"),
            product=str(record.get("product") or "Unknown"),
            cvssScore=score,
            severity=self.normalize_severity(record.get("severity"), score),
            isExploited=bool(record.get("is_exploited") or record.get("isExploited") or False),
            status=str(record.get("status") or "published"),
            publishedDate=self.parse_datetime(record.get("published_at") or record.get("publishedDate")),
            updatedDate=self.parse_datetime(record.get("updated_at") or record.get("updatedDate")),
            cvssMetrics=record.get("cvss_metrics") or record.get("cvssMetrics") or {},
            references=record.get("references") or [],
            relatedCves=record.get("related_cves") or record.get("relatedCves") or [],
            metadata={**(record.get("metadata") or {}), "feedId": feed_id, "provider": provider},
        )
        existing = await self.cves.get(cve_id)
        if existing:
            await self.cves.update(existing, CVEUpdate(**payload.model_dump(exclude={"cveId"})))
            return False
        await self.cves.create(payload)
        return True

    async def _upsert_ioc(self, record: dict[str, Any], *, feed_id: str, provider: str) -> bool:
        value = str(record.get("value") or "").strip()
        if not value:
            raise ValueError("IOC value is required")
        existing = await self.iocs.get_by_value(value)
        payload = IOCCreate(
            id=record.get("id") or self.stable_id("ioc", provider, value),
            value=value,
            type=str(record.get("type") or "domain").lower(),
            reputation=str(record.get("reputation") or "unknown").lower(),
            confidence=int(record.get("confidence") or 0),
            source=str(record.get("source") or provider),
            threatCount=int(record.get("threat_count") or record.get("threatCount") or 0),
            firstSeen=self.parse_datetime(record.get("first_seen") or record.get("firstSeen")),
            lastSeen=self.parse_datetime(record.get("last_seen") or record.get("lastSeen")),
            status=str(record.get("status") or "active").lower(),
            description=record.get("description"),
            whois=record.get("whois") or {},
            timeline=record.get("timeline") or [],
            relationships=record.get("relationships") or [],
            externalIntel=record.get("external_intel") or record.get("externalIntel") or [],
            metadata={**(record.get("metadata") or {}), "feedId": feed_id, "provider": provider},
        )
        if existing:
            await self.iocs.update(existing, IOCUpdate(**payload.model_dump(exclude={"id"})))
            return False
        await self.iocs.create(payload)
        return True
