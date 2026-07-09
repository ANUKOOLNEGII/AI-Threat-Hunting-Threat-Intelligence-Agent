from __future__ import annotations

from typing import Any

from pydantic import BaseModel


class DashboardPayload(BaseModel):
    generatedAt: str
    cache: dict[str, Any]
    data: dict[str, Any]
