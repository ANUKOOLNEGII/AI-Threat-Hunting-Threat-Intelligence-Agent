from __future__ import annotations

import json
from typing import Any

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.groq.client import GroqClient
from app.ai.schemas.ai import AIAnalysisRequest, AIChatRequest, DetectionRuleRequest
from app.ai.services.ai_service import AIService
from app.auth.middleware.auth import rate_limit, require_roles
from app.database.session import get_session

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/chat", response_model=None)
async def chat(payload: AIChatRequest, session: AsyncSession = Depends(get_session), user=Depends(rate_limit())) -> Any:
    service = AIService(session)
    if not payload.stream:
        return await service.chat(payload, user.id)

    async def events():
        result = await service.chat(payload.model_copy(update={"stream": False}), user.id)
        content = result["message"]["content"]
        for token in content.split():
            yield f"data: {json.dumps({'token': token + ' '})}\n\n"
        yield f"data: {json.dumps({'done': True, 'message': result['message']})}\n\n"

    return StreamingResponse(events(), media_type="text/event-stream")


@router.get("/history", response_model=list[dict[str, Any]])
async def history(session: AsyncSession = Depends(get_session), user=Depends(rate_limit())) -> list[dict[str, Any]]:
    return await AIService(session).history(user.id)


@router.delete("/history", response_model=dict[str, bool])
async def delete_history(session: AsyncSession = Depends(get_session), user=Depends(require_roles("admin", "analyst"))) -> dict[str, bool]:
    return await AIService(session).delete_history(user.id)


@router.get("/suggestions", response_model=list[dict[str, str]])
async def suggestions(session: AsyncSession = Depends(get_session), _user=Depends(rate_limit())) -> list[dict[str, str]]:
    return await AIService(session).suggestions()


@router.get("/health", response_model=dict[str, Any])
async def health(_user=Depends(rate_limit())) -> dict[str, Any]:
    return await GroqClient().health()


@router.post("/threat-summary", response_model=dict[str, Any])
async def threat_summary(payload: AIAnalysisRequest, session: AsyncSession = Depends(get_session), user=Depends(require_roles("admin", "analyst"))) -> dict[str, Any]:
    return await AIService(session).analyze(payload, user.id, agent_name="threat")


@router.post("/ioc-analysis", response_model=dict[str, Any])
async def ioc_analysis(payload: AIAnalysisRequest, session: AsyncSession = Depends(get_session), user=Depends(require_roles("admin", "analyst"))) -> dict[str, Any]:
    return await AIService(session).analyze(payload, user.id, agent_name="ioc")


@router.post("/cve-analysis", response_model=dict[str, Any])
async def cve_analysis(payload: AIAnalysisRequest, session: AsyncSession = Depends(get_session), user=Depends(require_roles("admin", "analyst"))) -> dict[str, Any]:
    return await AIService(session).analyze(payload, user.id, agent_name="cve")


@router.post("/malware-analysis", response_model=dict[str, Any])
async def malware_analysis(payload: AIAnalysisRequest, session: AsyncSession = Depends(get_session), user=Depends(require_roles("admin", "analyst"))) -> dict[str, Any]:
    return await AIService(session).analyze(payload, user.id, agent_name="malware")


@router.post("/phishing-analysis", response_model=dict[str, Any])
async def phishing_analysis(payload: AIAnalysisRequest, session: AsyncSession = Depends(get_session), user=Depends(require_roles("admin", "analyst"))) -> dict[str, Any]:
    return await AIService(session).analyze(payload, user.id, agent_name="phishing")


@router.post("/report-summary", response_model=dict[str, Any])
async def report_summary(payload: AIAnalysisRequest, session: AsyncSession = Depends(get_session), user=Depends(require_roles("admin", "analyst"))) -> dict[str, Any]:
    return await AIService(session).analyze(payload, user.id, agent_name="executive")


@router.post("/detection-rule", response_model=dict[str, Any])
async def detection_rule(payload: DetectionRuleRequest, session: AsyncSession = Depends(get_session), user=Depends(require_roles("admin", "analyst"))) -> dict[str, Any]:
    return await AIService(session).detection_rule(payload, user.id)


@router.post("/mitigation", response_model=dict[str, Any])
async def mitigation(payload: AIAnalysisRequest, session: AsyncSession = Depends(get_session), user=Depends(require_roles("admin", "analyst"))) -> dict[str, Any]:
    return await AIService(session).mitigation(payload, user.id)


@router.post("/attack-mapping", response_model=dict[str, Any])
async def attack_mapping(payload: AIAnalysisRequest, session: AsyncSession = Depends(get_session), user=Depends(require_roles("admin", "analyst"))) -> dict[str, Any]:
    return await AIService(session).analyze(payload, user.id, agent_name="mitre")


@router.post("/threat-correlation", response_model=dict[str, Any])
async def threat_correlation(payload: AIAnalysisRequest, session: AsyncSession = Depends(get_session), user=Depends(require_roles("admin", "analyst"))) -> dict[str, Any]:
    return await AIService(session).correlate(payload, user.id)
