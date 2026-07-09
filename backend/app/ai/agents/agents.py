from __future__ import annotations

from typing import Any


class BaseAIAgent:
    name = "base"

    def task(self) -> str:
        return "Analyze cybersecurity intelligence."

    def enrich_sections(self, sections: dict[str, Any], query: str) -> dict[str, Any]:
        return sections


class ThreatSummarizationAgent(BaseAIAgent):
    name = "threat_summary"

    def task(self) -> str:
        return "Summarize the threat intelligence record for SOC analysts."


class ThreatClassificationAgent(BaseAIAgent):
    name = "threat_classification"

    def task(self) -> str:
        return "Classify threat category, severity, actor behavior, and priority."


class ThreatCorrelationAgent(BaseAIAgent):
    name = "threat_correlation"

    def task(self) -> str:
        return "Identify likely relationships among threats, CVEs, IOCs, campaigns, and malware."


class CVEIntelligenceAgent(BaseAIAgent):
    name = "cve"

    def task(self) -> str:
        return "Explain vulnerability impact, exploitation likelihood, affected technology, and remediation priority."


class IOCIntelligenceAgent(BaseAIAgent):
    name = "ioc"

    def task(self) -> str:
        return "Analyze indicator reputation, likely use, confidence, and containment actions."


class MalwareAnalysisAgent(BaseAIAgent):
    name = "malware"

    def task(self) -> str:
        return "Analyze malware behavior, persistence, command and control, and detection opportunities."


class PhishingAnalysisAgent(BaseAIAgent):
    name = "phishing"

    def task(self) -> str:
        return "Analyze phishing infrastructure, lures, credential risk, and email controls."


class MitreMappingAgent(BaseAIAgent):
    name = "mitre"

    def task(self) -> str:
        return "Map observed behavior to MITRE ATT&CK tactics and techniques."


class RiskAssessmentAgent(BaseAIAgent):
    name = "risk"

    def task(self) -> str:
        return "Assess business and technical risk with confidence and prioritization."


class DetectionRuleAgent(BaseAIAgent):
    name = "detection"

    def task(self) -> str:
        return "Generate detection engineering output with validated syntax guidance and references."

    def enrich_sections(self, sections: dict[str, Any], query: str) -> dict[str, Any]:
        if not sections.get("detectionRule"):
            sections["detectionRule"] = (
                "title: AI Generated Threat Detection\n"
                "status: experimental\n"
                "description: Detects behavior described in the supplied threat intelligence context.\n"
                "logsource:\n  product: windows\n  service: security\n"
                "detection:\n  selection:\n    EventID:\n      - 4688\n      - 4698\n  condition: selection\n"
                "level: high"
            )
        return sections


class MitigationAgent(BaseAIAgent):
    name = "mitigation"

    def task(self) -> str:
        return "Generate concrete remediation, compensating controls, and validation steps."


class ExecutiveSummaryAgent(BaseAIAgent):
    name = "executive"

    def task(self) -> str:
        return "Create concise executive-level cyber risk summary."


AGENTS = {
    "threat": ThreatSummarizationAgent(),
    "classification": ThreatClassificationAgent(),
    "correlation": ThreatCorrelationAgent(),
    "cve": CVEIntelligenceAgent(),
    "ioc": IOCIntelligenceAgent(),
    "malware": MalwareAnalysisAgent(),
    "phishing": PhishingAnalysisAgent(),
    "mitre": MitreMappingAgent(),
    "risk": RiskAssessmentAgent(),
    "detection": DetectionRuleAgent(),
    "mitigation": MitigationAgent(),
    "executive": ExecutiveSummaryAgent(),
}
