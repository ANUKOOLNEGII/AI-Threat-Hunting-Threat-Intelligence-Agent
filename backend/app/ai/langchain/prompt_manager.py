from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass
class PromptTemplate:
    name: str
    version: str
    template: str

    def render(self, **kwargs: Any) -> str:
        return self.template.format(**kwargs)


class PromptManager:
    def __init__(self) -> None:
        self.templates = {
            "cyber_analyst": PromptTemplate(
                name="cyber_analyst",
                version="v1",
                template=(
                    "You are an enterprise cybersecurity analyst. Use only the supplied context and clearly separate facts from recommendations.\n"
                    "Task: {task}\nQuestion: {question}\nContext:\n{context}\nReturn markdown with executive summary, technical analysis, risk assessment, recommendations, MITRE references, and sources."
                ),
            ),
            "detection_rule": PromptTemplate(
                name="detection_rule",
                version="v1",
                template="Generate a {rule_type} detection rule for: {question}\nContext:\n{context}\nInclude description, severity, confidence, references, and rule content.",
            ),
            "mitigation": PromptTemplate(
                name="mitigation",
                version="v1",
                template="Create a mitigation plan for: {question}\nContext:\n{context}\nInclude patches, firewall/EDR controls, IOC blocking, workarounds, and validation.",
            ),
        }

    def render(self, name: str, **kwargs: Any) -> tuple[str, str]:
        template = self.templates.get(name, self.templates["cyber_analyst"])
        return template.render(**kwargs), template.version


class OutputParser:
    def sections_from_markdown(self, content: str) -> dict[str, Any]:
        def pick(header: str) -> str:
            marker = f"## {header}"
            if marker not in content:
                return ""
            rest = content.split(marker, 1)[1]
            next_header = rest.find("\n## ")
            return (rest[:next_header] if next_header != -1 else rest).strip()

        recommendations = [line[2:].strip() for line in pick("Recommendations").splitlines() if line.strip().startswith("- ")]
        return {
            "executiveSummary": pick("Executive Summary") or "Analysis generated from available threat intelligence context.",
            "technicalAnalysis": pick("Technical Analysis") or "No additional technical analysis was available.",
            "threatClassification": pick("Threat Classification") or None,
            "riskAssessment": pick("Risk Assessment") or None,
            "recommendations": recommendations,
            "mitreReference": pick("MITRE ATT&CK") or None,
            "detectionRule": pick("Detection Rule") or None,
        }
