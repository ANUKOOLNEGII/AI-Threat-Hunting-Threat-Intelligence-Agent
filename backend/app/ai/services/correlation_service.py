from __future__ import annotations

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.repositories import AIRepository
from app.threat_intel.repositories.cve_repository import CVERepository
from app.threat_intel.repositories.ioc_repository import IOCRepository
from app.threat_intel.repositories.threat_repository import ThreatRepository


class ThreatCorrelationService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repository = AIRepository(session)

    async def correlate(self, query: str = "") -> dict[str, Any]:
        threats, _ = await ThreatRepository(self.session).list(query=None, severity=None, category=None, status=None, source=None, page=1, page_size=100, sort_by="updatedAt", sort_dir="desc")
        cves, _ = await CVERepository(self.session).list(query=None, severity=None, vendor=None, product=None, status=None, exploited=None, min_cvss=None, max_cvss=None, page=1, page_size=100, sort_by="updatedDate", sort_dir="desc")
        iocs, _ = await IOCRepository(self.session).list(query=None, type_=None, reputation=None, status=None, page=1, page_size=100, sort_by="lastSeen", sort_dir="desc")
        relationships = []
        for threat in threats:
            text = f"{threat.title} {threat.summary} {' '.join(threat.reference_ids or [])}".lower()
            for cve in cves:
                if cve.cve_id.lower() in text or (threat.cvss_score and cve.severity == threat.severity):
                    relationships.append({"sourceId": threat.id, "sourceType": "threat", "targetId": cve.cve_id, "targetType": "cve", "relationType": "references-or-severity-match", "confidenceScore": 82})
            for ioc in iocs:
                if ioc.value.lower() in text or ioc.source.lower() == threat.source_name.lower():
                    relationships.append({"sourceId": threat.id, "sourceType": "threat", "targetId": ioc.id, "targetType": "ioc", "relationType": "indicator-or-source-match", "confidenceScore": 78})
        for rel in relationships[:50]:
            await self.repository.create_correlation(evidence=[{"query": query}], **rel)
        return {"relationships": relationships, "total": len(relationships), "confidenceScore": 80 if relationships else 55}
