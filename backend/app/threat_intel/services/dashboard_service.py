from __future__ import annotations

from datetime import datetime
import inspect
from typing import Any

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.threat_intel.cache.dashboard_cache import dashboard_cache
from app.threat_intel.models.cve import CVE
from app.threat_intel.models.ioc import IOC
from app.threat_intel.models.threat import Threat
from app.threat_intel.services.cve_service import CVEService
from app.threat_intel.services.ioc_service import IOCService
from app.threat_intel.services.threat_service import ThreatService


class DashboardService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.threats = ThreatService(session)
        self.cves = CVEService(session)
        self.iocs = IOCService(session)
        self.settings = get_settings()

    async def _cached(self, key: str, builder) -> dict[str, Any]:
        cached = await dashboard_cache.get(key)
        if cached is not None:
            return {"generatedAt": datetime.utcnow().isoformat(), "cache": {"hit": True, "ttlSeconds": self.settings.dashboard_cache_ttl_seconds}, "data": cached}
        result = builder()
        data = await result if inspect.isawaitable(result) else result
        await dashboard_cache.set(key, data)
        return {"generatedAt": datetime.utcnow().isoformat(), "cache": {"hit": False, "ttlSeconds": self.settings.dashboard_cache_ttl_seconds}, "data": data}

    async def _count(self, model) -> int:
        return int((await self.session.execute(select(func.count()).select_from(model))).scalar_one())

    async def severity_distribution(self) -> dict[str, Any]:
        async def build() -> dict[str, Any]:
            rows = await self.session.execute(select(Threat.severity, func.count()).group_by(Threat.severity))
            return {"items": [{"severity": name, "count": count} for name, count in rows.all()]}
        return await self._cached("severity", build)

    async def source_distribution(self) -> dict[str, Any]:
        async def build() -> dict[str, Any]:
            rows = await self.session.execute(select(Threat.source_name, func.count()).group_by(Threat.source_name).order_by(func.count().desc()).limit(10))
            return {"items": [{"source": name, "count": count} for name, count in rows.all()]}
        return await self._cached("sources", build)

    async def timeline(self, limit: int = 20) -> dict[str, Any]:
        async def build() -> dict[str, Any]:
            threats = (await self.session.execute(select(Threat).order_by(Threat.updated_at.desc()).limit(limit))).scalars().all()
            items = []
            for threat in threats:
                if threat.timeline:
                    items.extend(threat.timeline)
                else:
                    items.append({"id": threat.id, "timestamp": threat.updated_at.isoformat(), "title": threat.title, "description": threat.summary, "type": "updated"})
            return {"items": sorted(items, key=lambda item: item.get("timestamp", ""), reverse=True)[:limit]}
        return await self._cached(f"timeline:{limit}", build)

    async def recent_alerts(self, page: int, page_size: int) -> dict[str, Any]:
        async def build() -> dict[str, Any]:
            result = await self.threats.list(query=None, severity=None, category=None, status=None, source=None, page=page, page_size=page_size, sort_by="updatedAt", sort_dir="desc")
            result["items"] = [item for item in result["items"] if item["severity"] in {"critical", "high"}]
            result["total"] = len(result["items"])
            return result
        return await self._cached(f"alerts:{page}:{page_size}", build)

    async def statistics(self) -> dict[str, Any]:
        async def build() -> dict[str, Any]:
            critical_cves = int((await self.session.execute(select(func.count()).select_from(CVE).where(CVE.severity == "critical"))).scalar_one())
            malicious_iocs = int((await self.session.execute(select(func.count()).select_from(IOC).where(IOC.reputation == "malicious"))).scalar_one())
            active_threats = int((await self.session.execute(select(func.count()).select_from(Threat).where(Threat.status.in_(["active", "new", "investigating"])))).scalar_one())
            return {
                "totalThreats": await self._count(Threat),
                "criticalCves": critical_cves,
                "totalCves": await self._count(CVE),
                "totalIocs": await self._count(IOC),
                "maliciousIocs": malicious_iocs,
                "activeThreats": active_threats,
            }
        return await self._cached("statistics", build)

    async def summary(self) -> dict[str, Any]:
        async def build() -> dict[str, Any]:
            stats = (await self.statistics())["data"]
            recent = await self.threats.list(query=None, severity=None, category=None, status=None, source=None, page=1, page_size=5, sort_by="updatedAt", sort_dir="desc")
            return {"statistics": stats, "recentThreats": recent["items"], "lastSync": datetime.utcnow().isoformat()}
        return await self._cached("summary", build)

    async def widgets(self) -> dict[str, Any]:
        async def build() -> dict[str, Any]:
            stats = (await self.statistics())["data"]
            return {
                "statCards": [
                    {"title": "Total Threats Ingested", "metric": stats["totalThreats"], "variant": "primary"},
                    {"title": "Critical CVEs Flagged", "metric": stats["criticalCves"], "variant": "danger"},
                    {"title": "Malicious Indicators", "metric": stats["maliciousIocs"], "variant": "warning"},
                    {"title": "Total IOC Records", "metric": stats["totalIocs"], "variant": "success"},
                ],
                "quickActions": ["Search Threats", "Explore CVEs", "Investigate IOC", "Sync Console"],
            }
        return await self._cached("widgets", build)

    async def feed_status(self) -> dict[str, Any]:
        return await self._cached("feed-status", lambda: {
            "items": [
                {"name": "NIST NVD Feed", "status": "Configured", "statusColor": "text-severity-low"},
                {"name": "CISA KEV Ingest", "status": "Configured", "statusColor": "text-severity-low"},
                {"name": "Internal Intel", "status": "Online", "statusColor": "text-severity-low"},
                {"name": "Redis Dashboard Cache", "status": "Enabled", "statusColor": "text-severity-low"},
            ]
        })

    async def system_status(self) -> dict[str, Any]:
        return await self._cached("system-status", lambda: {"api": "online", "database": "online", "redisCache": "configured" if self.settings.redis_url else "memory-fallback", "environment": self.settings.environment})

    async def trends(self) -> dict[str, Any]:
        async def build() -> dict[str, Any]:
            rows = await self.session.execute(select(func.date(Threat.published_at), func.count()).group_by(func.date(Threat.published_at)).order_by(func.date(Threat.published_at)))
            return {"items": [{"label": str(day), "count": count} for day, count in rows.all()]}
        return await self._cached("trends", build)

    async def refresh(self) -> dict[str, Any]:
        await dashboard_cache.clear()
        return {"generatedAt": datetime.utcnow().isoformat(), "cache": {"cleared": True}, "data": {"message": "Dashboard cache refreshed"}}

    async def metadata(self) -> dict[str, Any]:
        return {"generatedAt": datetime.utcnow().isoformat(), "cache": {"hit": False}, "data": {"version": self.settings.app_version, "cacheTtlSeconds": self.settings.dashboard_cache_ttl_seconds, "supportedModules": ["dashboard", "threats", "cves", "iocs"]}}
