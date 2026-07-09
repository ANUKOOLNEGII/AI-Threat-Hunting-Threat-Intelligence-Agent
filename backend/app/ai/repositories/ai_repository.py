from __future__ import annotations

import hashlib
import uuid
from datetime import datetime
from typing import Any, Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.models import AIConversation, AIMessage, PromptLog, ThreatCorrelation, VectorDocument


class AIRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def create_conversation(self, *, user_id: str, title: str, context: Optional[dict[str, Any]] = None) -> AIConversation:
        conversation = AIConversation(id=f"conv-{uuid.uuid4().hex[:12]}", user_id=user_id, title=title, context=context or {})
        self.session.add(conversation)
        await self.session.commit()
        await self.session.refresh(conversation)
        return conversation

    async def get_conversation(self, conversation_id: str, user_id: str) -> Optional[AIConversation]:
        return (await self.session.execute(select(AIConversation).where(AIConversation.id == conversation_id, AIConversation.user_id == user_id))).scalar_one_or_none()

    async def list_conversations(self, user_id: str) -> list[AIConversation]:
        return list((await self.session.execute(select(AIConversation).where(AIConversation.user_id == user_id).order_by(AIConversation.updated_at.desc()))).scalars().all())

    async def delete_conversations(self, user_id: str) -> None:
        conversations = await self.list_conversations(user_id)
        for conversation in conversations:
            messages = await self.messages(conversation.id)
            for message in messages:
                await self.session.delete(message)
            await self.session.delete(conversation)
        await self.session.commit()

    async def add_message(self, *, conversation_id: str, role: str, content: str, status: str = "complete", confidence: Optional[str] = None, confidence_score: Optional[int] = None, sections: Optional[dict[str, Any]] = None, references: Optional[list[dict[str, Any]]] = None) -> AIMessage:
        message = AIMessage(
            id=f"msg-{uuid.uuid4().hex[:12]}",
            conversation_id=conversation_id,
            role=role,
            content=content,
            status=status,
            confidence=confidence,
            confidence_score=confidence_score,
            sections=sections or {},
            references=references or [],
        )
        self.session.add(message)
        conversation = (await self.session.execute(select(AIConversation).where(AIConversation.id == conversation_id))).scalar_one_or_none()
        if conversation:
            conversation.updated_at = datetime.utcnow()
        await self.session.commit()
        await self.session.refresh(message)
        return message

    async def messages(self, conversation_id: str) -> list[AIMessage]:
        return list((await self.session.execute(select(AIMessage).where(AIMessage.conversation_id == conversation_id).order_by(AIMessage.created_at))).scalars().all())

    async def log_prompt(self, *, user_id: Optional[str], agent: str, prompt: str, token_usage: dict[str, Any], metadata: Optional[dict[str, Any]] = None) -> PromptLog:
        row = PromptLog(
            id=f"prompt-{uuid.uuid4().hex[:12]}",
            user_id=user_id,
            agent=agent,
            prompt_version="v1",
            prompt_hash=hashlib.sha256(prompt.encode("utf-8")).hexdigest(),
            token_usage=token_usage,
            metadata_=metadata or {},
        )
        self.session.add(row)
        await self.session.commit()
        await self.session.refresh(row)
        return row

    async def upsert_vector(self, *, collection: str, source_type: str, source_id: str, title: str, content: str, embedding: list[float], metadata: Optional[dict[str, Any]] = None) -> VectorDocument:
        doc_id = f"{collection}:{source_type}:{source_id}"
        row = (await self.session.execute(select(VectorDocument).where(VectorDocument.id == doc_id))).scalar_one_or_none()
        if not row:
            row = VectorDocument(id=doc_id, collection=collection, source_type=source_type, source_id=source_id, title=title, content=content)
            self.session.add(row)
        row.embedding = embedding
        row.metadata_ = metadata or {}
        row.title = title
        row.content = content
        await self.session.commit()
        await self.session.refresh(row)
        return row

    async def vectors(self, collection: Optional[str] = None) -> list[VectorDocument]:
        stmt = select(VectorDocument)
        if collection:
            stmt = stmt.where(VectorDocument.collection == collection)
        return list((await self.session.execute(stmt)).scalars().all())

    async def create_correlation(self, *, source_id: str, source_type: str, target_id: str, target_type: str, relation_type: str, confidence_score: int, evidence: list[dict[str, Any]]) -> ThreatCorrelation:
        row = ThreatCorrelation(id=f"corr-{uuid.uuid4().hex[:12]}", source_id=source_id, source_type=source_type, target_id=target_id, target_type=target_type, relation_type=relation_type, confidence_score=confidence_score, evidence=evidence)
        self.session.add(row)
        await self.session.commit()
        await self.session.refresh(row)
        return row

    async def correlations(self, limit: int = 100) -> list[ThreatCorrelation]:
        return list((await self.session.execute(select(ThreatCorrelation).order_by(ThreatCorrelation.created_at.desc()).limit(limit))).scalars().all())
