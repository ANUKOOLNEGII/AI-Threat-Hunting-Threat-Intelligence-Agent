from __future__ import annotations

import json
import time
from typing import Any, Optional

import redis.asyncio as redis

from app.core.config import get_settings


class FeedCache:
    def __init__(self) -> None:
        self.settings = get_settings()
        self.ttl = self.settings.feed_cache_ttl_seconds
        self._memory: dict[str, tuple[float, Any]] = {}
        self._redis: Optional[redis.Redis] = None
        if self.settings.redis_url:
            # Configure Redis connection pooling for performance
            self._redis = redis.from_url(
                self.settings.redis_url,
                decode_responses=True,
                max_connections=50,
                socket_connect_timeout=5,
                socket_timeout=5,
                retry_on_timeout=True,
                health_check_interval=30,
            )

    async def get(self, key: str) -> Optional[Any]:
        cache_key = f"feeds:{key}"
        if self._redis:
            try:
                value = await self._redis.get(cache_key)
                return json.loads(value) if value else None
            except Exception:
                pass
        item = self._memory.get(cache_key)
        if not item:
            return None
        expires_at, value = item
        if expires_at < time.time():
            self._memory.pop(cache_key, None)
            return None
        return value

    async def set(self, key: str, value: Any) -> None:
        cache_key = f"feeds:{key}"
        if self._redis:
            try:
                await self._redis.setex(cache_key, self.ttl, json.dumps(value, default=str))
                return
            except Exception:
                pass
        self._memory[cache_key] = (time.time() + self.ttl, value)

    async def clear(self) -> None:
        if self._redis:
            try:
                keys = await self._redis.keys("feeds:*")
                if keys:
                    await self._redis.delete(*keys)
                return
            except Exception:
                pass
        self._memory.clear()


feed_cache = FeedCache()
