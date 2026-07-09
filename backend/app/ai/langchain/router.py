from __future__ import annotations


from typing import Optional


class AgentRouter:
    def route(self, text: str, explicit: Optional[str] = None) -> str:
        if explicit:
            return explicit
        lower = text.lower()
        if "sigma" in lower or "yara" in lower or "detection" in lower:
            return "detection"
        if "mitigation" in lower or "patch" in lower or "workaround" in lower:
            return "mitigation"
        if "ioc" in lower or any(token in lower for token in ["ip ", "domain", "hash"]):
            return "ioc"
        if "cve" in lower or "vulnerab" in lower:
            return "cve"
        if "malware" in lower or "ransomware" in lower:
            return "malware"
        if "correlat" in lower or "relationship" in lower:
            return "correlation"
        if "mitre" in lower or "attack" in lower:
            return "mitre"
        return "threat"
