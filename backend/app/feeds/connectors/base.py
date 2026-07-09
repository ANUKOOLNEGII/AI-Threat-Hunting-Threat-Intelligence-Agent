from __future__ import annotations

import asyncio
import os
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Any, Optional

import httpx

from app.core.config import get_settings


class ConnectorError(Exception):
    pass


@dataclass
class ConnectorConfig:
    feed_id: str
    feed_type: str
    name: str
    provider: str
    url: Optional[str]
    auth_type: str = "none"
    api_key_env: Optional[str] = None
    timeout_seconds: int = 20
    retry_count: int = 3
    rate_limit_per_minute: int = 60
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class ConnectorResult:
    records: list[dict[str, Any]]
    next_cursor: Optional[str] = None
    metadata: dict[str, Any] = field(default_factory=dict)


class RateLimiter:
    def __init__(self) -> None:
        self._hits: dict[str, list[float]] = {}

    async def check(self, key: str, limit_per_minute: int) -> None:
        now = asyncio.get_running_loop().time()
        hits = [hit for hit in self._hits.get(key, []) if now - hit < 60]
        if len(hits) >= limit_per_minute:
            raise ConnectorError("Connector rate limit exceeded")
        hits.append(now)
        self._hits[key] = hits


rate_limiter = RateLimiter()


class BaseConnector:
    connector_type = "base"
    default_endpoint: Optional[str] = None

    def __init__(self, config: ConnectorConfig) -> None:
        self.config = config
        self.settings = get_settings()

    def api_key(self) -> Optional[str]:
        if not self.config.api_key_env:
            return None
        return os.getenv(self.config.api_key_env)

    def auth_headers(self) -> dict[str, str]:
        key = self.api_key()
        if not key:
            return {}
        if self.config.auth_type == "bearer":
            return {"Authorization": f"Bearer {key}"}
        if self.config.auth_type == "header":
            return {"X-API-Key": key}
        return {"Authorization": key}

    async def health(self) -> dict[str, Any]:
        return {
            "connectorType": self.connector_type,
            "status": "configured",
            "authenticated": bool(self.api_key()),
            "endpoint": self.config.url or self.default_endpoint,
        }

    async def fetch(self, *, cursor: Optional[str] = None, use_network: bool = False) -> ConnectorResult:
        await rate_limiter.check(self.config.feed_id, self.config.rate_limit_per_minute)
        if not use_network:
            return ConnectorResult(records=self.sample_records(), metadata={"mode": "offline-sample"})
        return await self._fetch_with_retry(cursor=cursor)

    async def _fetch_with_retry(self, *, cursor: Optional[str]) -> ConnectorResult:
        endpoint = self.config.url or self.default_endpoint
        if not endpoint:
            raise ConnectorError("Connector endpoint is not configured")
        last_error: Optional[Exception] = None
        for attempt in range(self.config.retry_count + 1):
            try:
                async with httpx.AsyncClient(timeout=self.config.timeout_seconds, headers=self.auth_headers()) as client:
                    response = await client.get(endpoint, params=self.pagination_params(cursor))
                    response.raise_for_status()
                    payload = response.json()
                    return ConnectorResult(records=self.extract_records(payload), next_cursor=self.extract_cursor(payload), metadata={"attempt": attempt + 1, "mode": "network"})
            except Exception as exc:
                last_error = exc
                await asyncio.sleep(min(2**attempt, 5))
        raise ConnectorError(str(last_error) if last_error else "Connector request failed")

    def pagination_params(self, cursor: Optional[str]) -> dict[str, Any]:
        return {"cursor": cursor} if cursor else {}

    def extract_records(self, payload: Any) -> list[dict[str, Any]]:
        if isinstance(payload, list):
            return [item for item in payload if isinstance(item, dict)]
        if isinstance(payload, dict):
            for key in ("vulnerabilities", "items", "results", "data", "objects"):
                value = payload.get(key)
                if isinstance(value, list):
                    return [item for item in value if isinstance(item, dict)]
            return [payload]
        return []

    def extract_cursor(self, payload: Any) -> Optional[str]:
        if isinstance(payload, dict):
            cursor = payload.get("next") or payload.get("nextCursor") or payload.get("cursor")
            return str(cursor) if cursor else None
        return None

    def sample_records(self) -> list[dict[str, Any]]:
        now = datetime.utcnow()
        return [
            {
                "record_type": "threat",
                "external_id": f"{self.config.feed_id}-{self.connector_type}-sample-threat",
                "title": f"{self.config.provider} Sample Intelligence",
                "summary": f"Offline sample record from {self.config.provider}.",
                "category": "advisory",
                "severity": "medium",
                "status": "active",
                "source": {"name": self.config.provider, "type": self.source_type(), "url": self.config.url},
                "published_at": now.isoformat(),
                "updated_at": now.isoformat(),
                "tags": [{"id": self.connector_type, "label": self.config.provider, "color": "blue"}],
                "references": [self.config.url] if self.config.url else [],
                "metadata": {"connectorType": self.connector_type},
            }
        ]

    def source_type(self) -> str:
        if self.connector_type in {"nvd"}:
            return "nvd"
        if self.connector_type in {"cisa_kev"}:
            return "cisa"
        if self.connector_type in {"github_security", "rss", "vendor_advisory"}:
            return "vendor"
        return "community"
