from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.agents import AGENTS
from app.ai.groq.client import GroqClient
from app.ai.langchain.prompt_manager import OutputParser, PromptManager
from app.ai.langchain.router import AgentRouter
from app.ai.rag.rag_service import RAGService
from app.ai.repositories import AIRepository
from app.ai.schemas.ai import AIAnalysisRequest, AIChatRequest, DetectionRuleRequest
from app.ai.security.guard import AISecurityGuard
from app.ai.services.correlation_service import ThreatCorrelationService
from app.core.config import get_settings


SUGGESTIONS = [
    {"id": "sq-1", "label": "Explain today's critical CVEs", "icon": "search", "category": "cve", "prompt": "Summarize the most critical CVEs detected today and explain enterprise impact."},
    {"id": "sq-2", "label": "Analyze ransomware TTPs", "icon": "lock", "category": "ransomware", "prompt": "Provide a MITRE ATT&CK analysis of active ransomware tactics, techniques, and procedures."},
    {"id": "sq-3", "label": "Investigate IOC", "icon": "shield", "category": "ioc", "prompt": "Analyze this IOC and provide reputation, attribution, and recommended mitigations."},
    {"id": "sq-4", "label": "Generate Sigma rule", "icon": "file", "category": "malware", "prompt": "Generate a Sigma detection rule for scheduled task persistence."},
]


class AIService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.repository = AIRepository(session)
        self.rag = RAGService(session)
        self.prompts = PromptManager()
        self.parser = OutputParser()
        self.router = AgentRouter()
        self.groq = GroqClient()
        self.guard = AISecurityGuard()
        self.settings = get_settings()

    def confidence_label(self, score: int) -> str:
        if score >= 90:
            return "very-high"
        if score >= 75:
            return "high"
        if score >= 55:
            return "medium"
        return "low"

    def message_out(self, message) -> dict[str, Any]:
        return {
            "id": message.id,
            "role": message.role,
            "content": message.content,
            "status": message.status,
            "timestamp": message.created_at.isoformat(),
            "confidence": message.confidence,
            "confidenceScore": message.confidence_score,
            "sections": message.sections or None,
            "references": message.references or [],
        }

    async def conversation_out(self, conversation) -> dict[str, Any]:
        messages = await self.repository.messages(conversation.id)
        return {
            "id": conversation.id,
            "title": conversation.title,
            "createdAt": conversation.created_at.isoformat(),
            "updatedAt": conversation.updated_at.isoformat(),
            "messageCount": len(messages),
            "messages": [self.message_out(message) for message in messages],
            "context": conversation.context or None,
        }

    async def chat(self, payload: AIChatRequest, user_id: str) -> dict[str, Any]:
        prompt = self.guard.sanitize(payload.prompt)
        try:
            self.guard.validate_input(prompt)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
        conversation = await self.repository.get_conversation(payload.conversationId, user_id) if payload.conversationId else None
        if not conversation:
            title = payload.title or prompt[:80] or "AI Conversation"
            conversation = await self.repository.create_conversation(user_id=user_id, title=title, context=payload.context.model_dump() if payload.context else None)
        await self.repository.add_message(conversation_id=conversation.id, role="user", content=prompt)
        agent_name = self.router.route(prompt, payload.context.type if payload.context else None)
        agent = AGENTS.get(agent_name, AGENTS["threat"])
        rag_context = await self.rag.build_context(prompt, top_k=payload.topK)
        rendered_prompt, version = self.prompts.render("cyber_analyst", task=agent.task(), question=prompt, context=rag_context["context"])
        llm = await self.groq.complete(rendered_prompt)
        content = self.guard.filter_sensitive_output(llm["content"])
        sections = agent.enrich_sections(self.parser.sections_from_markdown(content), prompt)
        confidence_score = min(98, max(rag_context["confidenceScore"], self.settings.ai_confidence_threshold))
        assistant = await self.repository.add_message(
            conversation_id=conversation.id,
            role="assistant",
            content=content,
            confidence=self.confidence_label(confidence_score),
            confidence_score=confidence_score,
            sections=sections,
            references=rag_context["references"],
        )
        await self.repository.log_prompt(user_id=user_id, agent=agent.name, prompt=rendered_prompt, token_usage=llm.get("tokenUsage", {}), metadata={"promptVersion": version})
        return {"message": self.message_out(assistant), "conversation": await self.conversation_out(conversation), "sources": rag_context["references"], "tokenUsage": llm.get("tokenUsage", {})}

    async def history(self, user_id: str) -> list[dict[str, Any]]:
        conversations = await self.repository.list_conversations(user_id)
        return [await self.conversation_out(conversation) for conversation in conversations]

    async def delete_history(self, user_id: str) -> dict[str, bool]:
        await self.repository.delete_conversations(user_id)
        return {"deleted": True}

    async def suggestions(self) -> list[dict[str, str]]:
        return SUGGESTIONS

    async def analyze(self, payload: AIAnalysisRequest, user_id: str, *, agent_name: str) -> dict[str, Any]:
        query = payload.query or f"Analyze {payload.targetType or 'target'} {payload.targetId or ''}".strip()
        return await self.chat(AIChatRequest(prompt=query, context=None, topK=payload.topK), user_id)

    async def detection_rule(self, payload: DetectionRuleRequest, user_id: str) -> dict[str, Any]:
        query = payload.query or f"Generate {payload.ruleType} detection rule for {payload.targetId or 'the supplied context'}"
        rag_context = await self.rag.build_context(query, top_k=payload.topK)
        prompt, version = self.prompts.render("detection_rule", rule_type=payload.ruleType, question=query, context=rag_context["context"])
        llm = await self.groq.complete(prompt)
        sections = AGENTS["detection"].enrich_sections(self.parser.sections_from_markdown(llm["content"]), query)
        content = llm["content"]
        if sections.get("detectionRule") and "## Detection Rule" not in content:
            content = f"{content}\n\n## Detection Rule\n```yaml\n{sections['detectionRule']}\n```"
        message = await self.repository.add_message(conversation_id=(await self.repository.create_conversation(user_id=user_id, title="Detection Rule")).id, role="assistant", content=content, confidence="high", confidence_score=82, sections=sections, references=rag_context["references"])
        await self.repository.log_prompt(user_id=user_id, agent="detection", prompt=prompt, token_usage=llm.get("tokenUsage", {}), metadata={"promptVersion": version, "ruleType": payload.ruleType})
        return {"message": self.message_out(message), "sources": rag_context["references"], "tokenUsage": llm.get("tokenUsage", {})}

    async def mitigation(self, payload: AIAnalysisRequest, user_id: str) -> dict[str, Any]:
        query = payload.query or f"Generate mitigation plan for {payload.targetId or 'current threat context'}"
        return await self.chat(AIChatRequest(prompt=query, topK=payload.topK), user_id)

    async def correlate(self, payload: AIAnalysisRequest, user_id: str) -> dict[str, Any]:
        correlation = await ThreatCorrelationService(self.session).correlate(payload.query or "")
        response = await self.chat(AIChatRequest(prompt=payload.query or "Perform threat correlation across current intelligence.", topK=payload.topK), user_id)
        response["correlation"] = correlation
        return response
