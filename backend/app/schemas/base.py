from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, ConfigDict


class APIResponse(BaseModel):
    """Standard API response wrapper for successful requests."""

    success: bool = True
    message: str = "Request completed successfully"
    data: Optional[Any] = None


class ErrorResponse(BaseModel):
    """Standard error response wrapper."""

    success: bool = False
    message: str
    code: Optional[str] = None
    details: Optional[dict[str, Any]] = None


class HealthStatus(BaseModel):
    model_config = ConfigDict(extra="allow")

    status: str
    service: str
    version: str
    environment: str
    dependencies: dict[str, str]
