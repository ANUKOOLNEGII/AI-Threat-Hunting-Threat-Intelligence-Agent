from __future__ import annotations

from datetime import datetime
from typing import Any

from app.feeds.connectors.base import BaseConnector


class NVDConnector(BaseConnector):
    connector_type = "nvd"
    default_endpoint = "https://services.nvd.nist.gov/rest/json/cves/2.0"

    def extract_records(self, payload: Any) -> list[dict[str, Any]]:
        records = []
        for item in payload.get("vulnerabilities", []) if isinstance(payload, dict) else []:
            cve = item.get("cve", {})
            metrics = cve.get("metrics", {})
            cvss = 0.0
            severity = "informational"
            for metric_key in ("cvssMetricV31", "cvssMetricV30", "cvssMetricV2"):
                metric = metrics.get(metric_key, [])
                if metric:
                    cvss_data = metric[0].get("cvssData", {})
                    cvss = float(cvss_data.get("baseScore") or 0)
                    severity = str(metric[0].get("baseSeverity") or cvss_data.get("baseSeverity") or severity).lower()
                    break
            records.append(
                {
                    "record_type": "cve",
                    "cve_id": cve.get("id"),
                    "title": cve.get("id", "NVD CVE"),
                    "description": (cve.get("descriptions") or [{}])[0].get("value", "NVD vulnerability record"),
                    "vendor": "Unknown",
                    "product": "Unknown",
                    "cvss_score": cvss,
                    "severity": severity,
                    "is_exploited": False,
                    "published_at": cve.get("published"),
                    "updated_at": cve.get("lastModified"),
                    "references": [{"source": "NVD", "url": ref.get("url")} for ref in cve.get("references", {}).get("referenceData", []) if ref.get("url")],
                }
            )
        return records or super().extract_records(payload)

    def sample_records(self) -> list[dict[str, Any]]:
        now = datetime.utcnow().isoformat()
        return [
            {
                "record_type": "cve",
                "cve_id": "CVE-2099-40001",
                "title": "NVD Sample Remote Code Execution",
                "description": "Sample NVD CVE used for offline ingestion validation.",
                "vendor": "SampleVendor",
                "product": "SampleProduct",
                "cvss_score": 9.4,
                "severity": "critical",
                "is_exploited": False,
                "published_at": now,
                "updated_at": now,
                "references": [{"source": "NVD", "url": "https://nvd.nist.gov"}],
            }
        ]


class CISAKEVConnector(BaseConnector):
    connector_type = "cisa_kev"
    default_endpoint = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json"

    def extract_records(self, payload: Any) -> list[dict[str, Any]]:
        records = []
        for item in payload.get("vulnerabilities", []) if isinstance(payload, dict) else []:
            records.append(
                {
                    "record_type": "cve",
                    "cve_id": item.get("cveID"),
                    "title": item.get("vulnerabilityName") or item.get("cveID"),
                    "description": item.get("shortDescription") or "CISA KEV vulnerability",
                    "vendor": item.get("vendorProject") or "Unknown",
                    "product": item.get("product") or "Unknown",
                    "cvss_score": 0.0,
                    "severity": "high",
                    "is_exploited": True,
                    "published_at": item.get("dateAdded"),
                    "updated_at": item.get("dateAdded"),
                    "references": [{"source": "CISA KEV", "url": self.default_endpoint}],
                }
            )
        return records or super().extract_records(payload)


class VirusTotalConnector(BaseConnector):
    connector_type = "virustotal"
    default_endpoint = "https://www.virustotal.com/api/v3/intelligence/search"

    def sample_records(self) -> list[dict[str, Any]]:
        now = datetime.utcnow().isoformat()
        return [
            {
                "record_type": "ioc",
                "value": "203.0.113.44",
                "type": "ip",
                "reputation": "malicious",
                "confidence": 88,
                "source": "VirusTotal",
                "first_seen": now,
                "last_seen": now,
                "status": "active",
                "description": "Offline VirusTotal sample malicious IP.",
            }
        ]


class ShodanConnector(BaseConnector):
    connector_type = "shodan"
    default_endpoint = "https://api.shodan.io/shodan/host/search"


class AlienVaultOTXConnector(BaseConnector):
    connector_type = "alienvault_otx"
    default_endpoint = "https://otx.alienvault.com/api/v1/pulses/subscribed"


class GitHubSecurityConnector(BaseConnector):
    connector_type = "github_security"
    default_endpoint = "https://api.github.com/advisories"


class MISPConnector(BaseConnector):
    connector_type = "misp"


class MitreAttackConnector(BaseConnector):
    connector_type = "mitre_attack"
    default_endpoint = "https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json"

    def sample_records(self) -> list[dict[str, Any]]:
        records = super().sample_records()
        records[0]["metadata"]["metadataOnly"] = True
        records[0]["category"] = "advisory"
        records[0]["severity"] = "informational"
        return records


class RSSSecurityConnector(BaseConnector):
    connector_type = "rss"


class VendorAdvisoryConnector(BaseConnector):
    connector_type = "vendor_advisory"


class SampleConnector(BaseConnector):
    connector_type = "sample"


CONNECTOR_REGISTRY = {
    "nvd": NVDConnector,
    "cisa_kev": CISAKEVConnector,
    "virustotal": VirusTotalConnector,
    "shodan": ShodanConnector,
    "alienvault_otx": AlienVaultOTXConnector,
    "github_security": GitHubSecurityConnector,
    "misp": MISPConnector,
    "mitre_attack": MitreAttackConnector,
    "rss": RSSSecurityConnector,
    "vendor_advisory": VendorAdvisoryConnector,
    "sample": SampleConnector,
}
