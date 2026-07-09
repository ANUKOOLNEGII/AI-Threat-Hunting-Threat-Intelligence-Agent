from __future__ import annotations

from typing import Any, Literal, Optional

from pydantic import BaseModel, Field

ConfidenceLevel = Literal["very-high", "high", "medium", "low"]


class AIReference(BaseModel):
    id: str
    source: str
    title: str
    url: str
    relevance: Literal["high", "medium", "low"] = "medium"
    publishedDate: Optional[str] = None


class AIResponseSections(BaseModel):
    executiveSummary: str
    technicalAnalysis: str
    threatClassification: Optional[str] = None
    riskAssessment: Optional[str] = None
    recommendations: list[str] = Field(default_factory=list)
    mitreReference: Optional[str] = None
    detectionRule: Optional[str] = None


class AIMessageOut(BaseModel):
    id: str
    role: Literal["user", "assistant", "system"]
    content: str
    status: Literal["sending", "streaming", "complete", "error"] = "complete"
    timestamp: str
    confidence: Optional[ConfidenceLevel] = None
    confidenceScore: Optional[int] = None
    sections: Optional[AIResponseSections] = None
    references: list[AIReference] = Field(default_factory=list)


class InvestigationContext(BaseModel):
    type: Literal["cve", "ioc", "malware", "campaign", "actor", "general"] = "general"
    id: str
    label: str
    severity: Optional[str] = None


class AIConversationOut(BaseModel):
    id: str
    title: str
    createdAt: str
    updatedAt: str
    messageCount: int
    messages: list[AIMessageOut] = Field(default_factory=list)
    context: Optional[InvestigationContext] = None


class AIChatRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=12000)
    conversationId: Optional[str] = None
    title: Optional[str] = Field(default=None, max_length=160)
    context: Optional[InvestigationContext] = None
    stream: bool = False
    topK: int = Field(default=5, ge=1, le=20)


class AIAnalysisRequest(BaseModel):
    query: Optional[str] = Field(default=None, max_length=12000)
    targetId: Optional[str] = Field(default=None, max_length=160)
    targetType: Optional[str] = Field(default=None, max_length=80)
    context: dict[str, Any] = Field(default_factory=dict)
    topK: int = Field(default=5, ge=1, le=20)


class DetectionRuleRequest(AIAnalysisRequest):
    ruleType: Literal["sigma", "yara", "snort", "suricata", "windows", "linux", "edr"] = "sigma"


class AIResponse(BaseModel):
    message: AIMessageOut
    conversation: Optional[AIConversationOut] = None
    sources: list[AIReference] = Field(default_factory=list)
    tokenUsage: dict[str, Any] = Field(default_factory=dict)


class SuggestedQuestion(BaseModel):
    id: str
    label: str
    icon: str
    category: str
    prompt: str
