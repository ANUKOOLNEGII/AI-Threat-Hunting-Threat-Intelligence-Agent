from fastapi.testclient import TestClient

from app.main import create_app


def test_login_with_default_seed_user() -> None:
    app = create_app()
    client = TestClient(app)

    response = client.post(
        "/auth/login",
        json={"email": "admin@aegis.local", "password": "password123"},
    )

    assert response.status_code == 200
    data = response.json()
    assert "token" in data
    assert "refreshToken" in data
    assert data["user"]["email"] == "admin@aegis.local"


def test_profile_requires_authentication() -> None:
    app = create_app()
    client = TestClient(app)

    response = client.get("/users/profile")
    assert response.status_code == 401
