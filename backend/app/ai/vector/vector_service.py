from __future__ import annotations

import math
import re
from typing import Any, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.repositories import AIRepository
from app.core.config import get_settings
from app.threat_intel.repositories.cve_repository import CVERepository
from app.threat_intel.repositories.ioc_repository import IOCRepository
from app.threat_intel.repositories.threat_repository import ThreatRepository


COLLECTIONS = ["threat_reports", "threat_articles", "cves", "iocs", "malware", "threat_actors", "mitre_attack", "security_advisories", "vendor_advisories", "ai_conversations"]


class EmbeddingService:
    def embed(self, text: str) -> list[float]:
        buckets = [0.0] * 64
        for token in re.findall(r"[a-zA-Z0-9_\-.]+", text.lower()):
            buckets[hash(token) % len(buckets)] += 1.0
        norm = math.sqrt(sum(value * value for value in buckets)) or 1.0
        return [round(value / norm, 6) for value in buckets]

    def similarity(self, left: list[float], right: list[float]) -> float:
        return sum(a * b for a, b in zip(left, right))


class VectorService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repository = AIRepository(session)
        self.embedding = EmbeddingService()
        self.settings = get_settings()

    async def ensure_collections(self) -> list[str]:
        return [f"{self.settings.ai_vector_collection_prefix}_{name}" for name in COLLECTIONS]

    async def index_current_intel(self) -> int:
        count = 0
        threats, _ = await ThreatRepository(self.session).list(query=None, severity=None, category=None, status=None, source=None, page=1, page_size=500, sort_by="updatedAt", sort_dir="desc")
        for threat in threats:
            content = f"{threat.title}\n{threat.summary}\n{threat.description or ''}"
            await self.repository.upsert_vector(collection="threat_reports", source_type="threat", source_id=threat.id, title=threat.title, content=content, embedding=self.embedding.embed(content), metadata={"severity": threat.severity, "source": threat.source_name})
            count += 1
        cves, _ = await CVERepository(self.session).list(query=None, severity=None, vendor=None, product=None, status=None, exploited=None, min_cvss=None, max_cvss=None, page=1, page_size=500, sort_by="updatedDate", sort_dir="desc")
        for cve in cves:
            content = f"{cve.cve_id} {cve.title}\n{cve.description}\n{cve.vendor} {cve.product}"
            await self.repository.upsert_vector(collection="cves", source_type="cve", source_id=cve.cve_id, title=cve.title, content=content, embedding=self.embedding.embed(content), metadata={"severity": cve.severity, "cvss": cve.cvss_score})
            count += 1
        iocs, _ = await IOCRepository(self.session).list(query=None, type_=None, reputation=None, status=None, page=1, page_size=500, sort_by="lastSeen", sort_dir="desc")
        for ioc in iocs:
            content = f"{ioc.value} {ioc.type} {ioc.reputation}\n{ioc.description or ''}\n{ioc.source}"
            await self.repository.upsert_vector(collection="iocs", source_type="ioc", source_id=ioc.id, title=ioc.value, content=content, embedding=self.embedding.embed(content), metadata={"reputation": ioc.reputation, "confidence": ioc.confidence})
            count += 1
        return count

    async def search(self, query: str, *, top_k: int = 5, collection: Optional[str] = None, metadata_filter: Optional[dict[str, Any]] = None) -> list[dict[str, Any]]:
        await self.index_current_intel()
        query_embedding = self.embedding.embed(query)
        docs = await self.repository.vectors(collection=collection)
        results = []
        for doc in docs:
            if metadata_filter and any(doc.metadata_.get(key) != value for key, value in metadata_filter.items()):
                continue
            score = self.embedding.similarity(query_embedding, doc.embedding)
            results.append({"id": doc.id, "title": doc.title, "content": doc.content, "sourceType": doc.source_type, "sourceId": doc.source_id, "collection": doc.collection, "metadata": doc.metadata_, "similarity": round(score, 4)})
        return sorted(results, key=lambda item: item["similarity"], reverse=True)[:top_k]
