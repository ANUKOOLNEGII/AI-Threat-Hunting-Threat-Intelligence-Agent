from __future__ import annotations

import uuid

from fastapi.testclient import TestClient

from app.feeds.connectors import CONNECTOR_REGISTRY, ConnectorConfig
from app.main import create_app
from app.workers.celery_app import celery_app


def auth_headers(client: TestClient) -> dict[str, str]:
    response = client.post("/auth/login", json={"email": "admin@aegis.local", "password": "password123"})
    assert response.status_code == 200
    return {"Authorization": f"Bearer {response.json()['token']}"}


def feed_payload(feed_id: str) -> dict[str, object]:
    return {
        "id": feed_id,
        "name": "Phase 4 Sample Feed",
        "provider": "Phase4 Provider",
        "feedType": "sample",
        "enabled": True,
        "authType": "none",
        "schedule": "*/5 * * * *",
        "intervalSeconds": 300,
        "timeoutSeconds": 5,
        "retryCount": 1,
        "rateLimitPerMinute": 60,
        "metadata": {"test": True},
    }


def test_connector_registry_initializes_required_connectors() -> None:
    expected = {"nvd", "cisa_kev", "virustotal", "shodan", "alienvault_otx", "github_security", "misp", "mitre_attack", "rss", "vendor_advisory"}
    assert expected.issubset(CONNECTOR_REGISTRY.keys())
    connector = CONNECTOR_REGISTRY["nvd"](
        ConnectorConfig(feed_id="feed-test", feed_type="nvd", name="NVD", provider="NVD", url=None)
    )
    records = connector.sample_records()
    assert records[0]["record_type"] == "cve"


def test_feed_crud_sync_normalization_deduplication_and_logs() -> None:
    client = TestClient(create_app())
    headers = auth_headers(client)
    feed_id = f"feed-phase4-{uuid.uuid4().hex[:8]}"

    assert client.post("/feeds", json=feed_payload(feed_id)).status_code == 401

    created = client.post("/feeds", json=feed_payload(feed_id), headers=headers)
    assert created.status_code == 201
    assert created.json()["id"] == feed_id

    updated = client.put(f"/feeds/{feed_id}", json={"enabled": True, "metadata": {"updated": True}}, headers=headers)
    assert updated.status_code == 200
    assert updated.json()["metadata"]["updated"] is True

    first_sync = client.post(f"/feeds/sync/{feed_id}", json={"useNetwork": False}, headers=headers)
    assert first_sync.status_code == 200
    assert first_sync.json()["status"] == "success"
    assert first_sync.json()["created"] >= 1

    second_sync = client.post(f"/feeds/sync/{feed_id}", json={"useNetwork": False}, headers=headers)
    assert second_sync.status_code == 200
    assert second_sync.json()["updated"] >= 1

    threats = client.get("/threats", params={"source": "Phase4 Provider"}, headers=headers)
    assert threats.status_code == 200
    assert threats.json()["total"] >= 1

    history = client.get("/feeds/history", params={"feedId": feed_id}, headers=headers)
    assert history.status_code == 200
    assert history.json()["total"] >= 2

    logs = client.get("/feeds/logs", params={"feedId": feed_id}, headers=headers)
    assert logs.status_code == 200
    assert logs.json()["total"] >= 1

    stats = client.get("/feeds/statistics", headers=headers)
    assert stats.status_code == 200
    assert stats.json()["totalFeeds"] >= 1

    health = client.get("/feeds/health", headers=headers)
    assert health.status_code == 200
    assert "items" in health.json()

    assert client.delete(f"/feeds/{feed_id}", headers=headers).status_code == 204


def test_scheduler_jobs_run_pause_resume_and_history() -> None:
    client = TestClient(create_app())
    headers = auth_headers(client)
    feed_id = f"feed-scheduler-{uuid.uuid4().hex[:8]}"
    assert client.post("/feeds", json=feed_payload(feed_id), headers=headers).status_code == 201

    jobs = client.get("/scheduler/jobs", headers=headers)
    assert jobs.status_code == 200
    assert jobs.json()["total"] >= 1

    run = client.post("/scheduler/run", json={"jobId": "feed-sync-5m", "feedId": feed_id}, headers=headers)
    assert run.status_code == 200
    assert run.json()["history"]["status"] == "success"

    pause = client.post("/scheduler/pause", json={"jobId": "feed-sync-5m"}, headers=headers)
    assert pause.status_code == 200
    assert pause.json()["enabled"] is False

    resume = client.post("/scheduler/resume", json={"jobId": "feed-sync-5m"}, headers=headers)
    assert resume.status_code == 200
    assert resume.json()["enabled"] is True

    status = client.get("/scheduler/status", headers=headers)
    assert status.status_code == 200
    assert status.json()["status"] == "operational"

    history = client.get("/scheduler/history", params={"jobId": "feed-sync-5m"}, headers=headers)
    assert history.status_code == 200
    assert history.json()["total"] >= 1

    assert client.delete(f"/feeds/{feed_id}", headers=headers).status_code == 204


def test_celery_worker_tasks_are_registered() -> None:
    registered = celery_app.tasks.keys()
    assert "app.workers.tasks.sync_feed_task" in registered
    assert "app.workers.tasks.worker_health_task" in registered
