from fastapi.testclient import TestClient

from app.main import create_app


def test_health_endpoint_returns_ok() -> None:
    app = create_app()
    client = TestClient(app)

    response = client.get("/health")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "ai-threat-hunting-agent"


def test_detailed_health_endpoint_reports_dependencies() -> None:
    app = create_app()
    client = TestClient(app)

    response = client.get("/health/detailed")

    assert response.status_code == 200
    data = response.json()
    assert "dependencies" in data
    assert "version" in data
