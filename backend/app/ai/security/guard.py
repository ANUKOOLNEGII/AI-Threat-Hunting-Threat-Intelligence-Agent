from __future__ import annotations

import re
from typing import Any


class AISecurityGuard:
    BLOCK_PATTERNS = [
        r"ignore\s+(all\s+)?previous\s+instructions",
        r"reveal\s+(the\s+)?system\s+prompt",
        r"dump\s+secrets",
        r"api[_\s-]?key",
        r"exfiltrate",
    ]

    def sanitize(self, text: str) -> str:
        clean = text.replace("\x00", "").strip()
        return clean[:12000]

    def validate_input(self, text: str) -> None:
        lowered = text.lower()
        for pattern in self.BLOCK_PATTERNS:
            if re.search(pattern, lowered):
                raise ValueError("Prompt rejected by AI security policy")

    def filter_sensitive_output(self, text: str) -> str:
        text = re.sub(r"(?i)(api[_-]?key|token|secret)\s*[:=]\s*['\"]?[\w\-\.]{12,}", r"\1=[redacted]", text)
        return text

    def validate_confidence(self, score: int, threshold: int) -> bool:
        return score >= threshold

    def safe_metadata(self, metadata: dict[str, Any]) -> dict[str, Any]:
        return {key: value for key, value in metadata.items() if "secret" not in key.lower() and "token" not in key.lower()}
