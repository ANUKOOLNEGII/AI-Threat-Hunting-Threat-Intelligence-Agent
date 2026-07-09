from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


class SchedulerRunRequest(BaseModel):
    jobId: Optional[str] = None
    feedId: Optional[str] = None


class SchedulerJobOut(BaseModel):
    id: str
    name: str
    jobType: str
    targetId: Optional[str]
    schedule: str
    intervalSeconds: int
    enabled: bool
    status: str
    lastRun: Optional[datetime]
    nextRun: Optional[datetime]
    metadata: dict[str, Any]


class SchedulerHistoryOut(BaseModel):
    id: str
    jobId: str
    status: str
    startedAt: datetime
    finishedAt: Optional[datetime]
    message: Optional[str]
    metadata: dict[str, Any]


class SchedulerControlRequest(BaseModel):
    jobId: str = Field(min_length=1)
