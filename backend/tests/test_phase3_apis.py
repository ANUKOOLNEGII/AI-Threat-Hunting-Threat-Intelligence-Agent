from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi.testclient import TestClient

from app.main import create_app


def auth_headers(client: TestClient) -> dict[str, str]:
    response = client.post("/auth/login", json={"email": "admin@aegis.local", "password": "password123"})
    assert response.status_code == 200
    return {"Authorization": f"Bearer {response.json()['token']}"}


def iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def test_threat_crud_search_filter_sort_and_rbac() -> None:
    client = TestClient(create_app())
    headers = auth_headers(client)
    threat_id = f"threat-test-{uuid.uuid4().hex[:8]}"

    payload: dict[str, Any] = {
        "id": threat_id,
        "title": "Phase 3 Critical RCE Campaign",
        "summary": "Test threat for dashboard aggregation.",
        "category": "vulnerability",
        "severity": "critical",
        "status": "active",
        "source": {"name": "Internal Intel", "type": "internal"},
        "publishedAt": iso_now(),
        "tags": [{"id": "phase3", "label": "Phase3", "color": "blue"}],
    }

    assert client.post("/threats", json=payload).status_code == 401
    created = client.post("/threats", json=payload, headers=headers)
    assert created.status_code == 201
    assert created.json()["id"] == threat_id

    listed = client.get("/threats", params={"severity": "critical", "sortBy": "severity", "sortDir": "desc"}, headers=headers)
    assert listed.status_code == 200
    assert any(item["id"] == threat_id for item in listed.json()["items"])

    searched = client.get("/threats/search", params={"query": "Phase 3 Critical"}, headers=headers)
    assert searched.status_code == 200
    assert searched.json()["total"] >= 1

    updated = client.put(f"/threats/{threat_id}", json={"status": "investigating"}, headers=headers)
    assert updated.status_code == 200
    assert updated.json()["status"] == "investigating"

    deleted = client.delete(f"/threats/{threat_id}", headers=headers)
    assert deleted.status_code == 204


def test_cve_crud_filters_validation_and_sorting() -> None:
    client = TestClient(create_app())
    headers = auth_headers(client)
    cve_id = f"CVE-2099-{uuid.uuid4().int % 900000 + 100000}"

    payload = {
        "cveId": cve_id,
        "title": "Phase 3 CVE Storage Test",
        "description": "Storage-only CVE foundation test.",
        "vendor": "PhaseVendor",
        "product": "PhaseProduct",
        "cvssScore": 9.1,
        "severity": "critical",
        "isExploited": True,
        "status": "published",
        "publishedDate": iso_now(),
    }

    invalid = dict(payload, cveId="BAD-1")
    assert client.post("/cves", json=invalid, headers=headers).status_code == 422

    created = client.post("/cves", json=payload, headers=headers)
    assert created.status_code == 201
    assert created.json()["cveId"] == cve_id

    listed = client.get("/cves", params={"vendor": "PhaseVendor", "severity": "critical", "minCvss": 9, "sortBy": "cvssScore"}, headers=headers)
    assert listed.status_code == 200
    assert any(item["cveId"] == cve_id for item in listed.json()["items"])

    updated = client.put(f"/cves/{cve_id}", json={"status": "modified", "cvssScore": 8.8}, headers=headers)
    assert updated.status_code == 200
    assert updated.json()["status"] == "modified"

    assert client.delete(f"/cves/{cve_id}", headers=headers).status_code == 204


def test_ioc_crud_filters_pagination_and_dashboard_cache() -> None:
    client = TestClient(create_app())
    headers = auth_headers(client)
    ioc_id = f"ioc-test-{uuid.uuid4().hex[:8]}"

    payload = {
        "id": ioc_id,
        "value": f"{uuid.uuid4().hex}.example.test",
        "type": "domain",
        "reputation": "malicious",
        "confidence": 91,
        "source": "Internal Intel",
        "threatCount": 1,
        "firstSeen": iso_now(),
        "lastSeen": iso_now(),
        "status": "active",
    }

    created = client.post("/iocs", json=payload, headers=headers)
    assert created.status_code == 201

    listed = client.get("/iocs", params={"type": "domain", "reputation": "malicious", "page": 1, "pageSize": 5}, headers=headers)
    assert listed.status_code == 200
    assert listed.json()["pageSize"] == 5

    stats_first = client.get("/dashboard/statistics", headers=headers)
    stats_second = client.get("/dashboard/statistics", headers=headers)
    assert stats_first.status_code == 200
    assert stats_second.status_code == 200
    assert stats_second.json()["cache"]["hit"] is True

    assert client.post("/dashboard/refresh", headers=headers).status_code == 200
    assert client.get("/dashboard/system-status", headers=headers).json()["data"]["api"] == "online"

    assert client.delete(f"/iocs/{ioc_id}", headers=headers).status_code == 204
