import importlib
import os
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))


@pytest.fixture()
def client(tmp_path):
    db_path = tmp_path / "test_travel_journal.db"
    os.environ["DATABASE_URL"] = f"sqlite:///{db_path}"

    import backend.app.database as database
    import backend.app.main as main

    importlib.reload(database)
    importlib.reload(main)

    with TestClient(main.app) as test_client:
        yield test_client


def test_registration_and_login(client):
    register_response = client.post(
        "/auth/register",
        json={"email": "demo@example.com", "password": "StrongPass1!"},
    )

    assert register_response.status_code == 200
    assert register_response.json()["message"] == "Registration successful"
    assert "access_token" in register_response.json()

    login_response = client.post(
        "/auth/login",
        json={"email": "demo@example.com", "password": "StrongPass1!"},
    )

    assert login_response.status_code == 200
    assert login_response.json()["message"] == "Login successful"
