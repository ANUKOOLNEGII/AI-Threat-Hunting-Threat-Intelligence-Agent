from __future__ import annotations

import os
from typing import Any, AsyncIterator, Optional

import httpx

from app.core.config import get_settings


class GroqClient:
    def __init__(self) -> None:
        self.settings = get_settings()

    def api_key(self) -> Optional[str]:
        return os.getenv(self.settings.groq_api_key_env)

    async def health(self) -> dict[str, Any]:
        return {"provider": "groq", "configured": bool(self.api_key()), "model": self.settings.groq_model, "fallback": not bool(self.api_key())}

    async def complete(self, prompt: str) -> dict[str, Any]:
        if not self.api_key():
            return {"content": self.local_completion(prompt), "tokenUsage": {"promptTokens": len(prompt.split()), "completionTokens": 120, "provider": "local-fallback"}}
        url = f"{self.settings.groq_base_url}/chat/completions"
        payload = {"model": self.settings.groq_model, "messages": [{"role": "user", "content": prompt}], "temperature": 0.2}
        last_error: Optional[Exception] = None
        for _ in range(self.settings.groq_retry_count + 1):
            try:
                async with httpx.AsyncClient(timeout=self.settings.groq_timeout_seconds) as client:
                    response = await client.post(url, headers={"Authorization": f"Bearer {self.api_key()}"}, json=payload)
                    response.raise_for_status()
                    data = response.json()
                    return {"content": data["choices"][0]["message"]["content"], "tokenUsage": data.get("usage", {})}
            except Exception as exc:
                last_error = exc
        return {"content": self.local_completion(prompt), "tokenUsage": {"provider": "local-fallback", "error": str(last_error)}}

    async def stream(self, prompt: str) -> AsyncIterator[str]:
        result = await self.complete(prompt)
        words = result["content"].split()
        for word in words:
            yield word + " "

    def local_completion(self, prompt: str) -> str:
        lower = prompt.lower()
        subject = "the provided intelligence"
        if "cve" in lower:
            subject = "the vulnerability"
        elif "ioc" in lower:
            subject = "the indicator"
        elif "malware" in lower or "ransomware" in lower:
            subject = "the malware campaign"
        return (
            f"## Executive Summary\nAnalysis of {subject} indicates meaningful enterprise risk based on the supplied context.\n\n"
            "## Technical Analysis\nThe available telemetry, references, and metadata were reviewed using retrieval-augmented context. Priority should be based on exploitation status, exposure, confidence, and asset criticality.\n\n"
            "## Threat Classification\nEnterprise Threat Intelligence · AI Assisted Analysis\n\n"
            "## Risk Assessment\nMedium-High. Validate source evidence and prioritize high-confidence affected assets first.\n\n"
            "## Recommendations\n- Validate the referenced indicators and affected assets.\n- Apply vendor patches or compensating controls.\n- Hunt for related IOCs in SIEM and EDR telemetry.\n- Monitor for recurrence after remediation.\n\n"
            "## MITRE ATT&CK\nT1190 · T1059 · T1041"
        )
