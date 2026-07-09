from __future__ import annotations

from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.langchain.prompt_manager import PromptManager
from app.ai.vector.vector_service import VectorService


class RAGService:
    def __init__(self, session: AsyncSession) -> None:
        self.vector = VectorService(session)
        self.prompts = PromptManager()

    async def build_context(self, query: str, *, top_k: int = 5) -> dict[str, Any]:
        docs = await self.vector.search(query, top_k=top_k)
        context = "\n\n".join(f"[{idx + 1}] {doc['title']} ({doc['sourceType']}:{doc['sourceId']})\n{doc['content'][:1200]}" for idx, doc in enumerate(docs))
        references = [
            {"id": doc["id"], "source": doc["sourceType"].upper(), "title": doc["title"], "url": f"urn:{doc['sourceType']}:{doc['sourceId']}", "relevance": "high" if doc["similarity"] > 0.25 else "medium"}
            for doc in docs
        ]
        confidence = min(95, 60 + int(sum(doc["similarity"] for doc in docs[:3]) * 20))
        return {"context": context or "No indexed intelligence context available.", "references": references, "confidenceScore": max(confidence, 55), "documents": docs}
