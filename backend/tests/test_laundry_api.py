import os
from typing import Generator

import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel

os.environ.setdefault("LAUNDRY_DATABASE_URL", "sqlite://")

from main import app  # noqa: E402  pylint: disable=wrong-import-position
from models.db import engine  # noqa: E402  pylint: disable=wrong-import-position


@pytest.fixture(autouse=True)
def prepare_db() -> Generator[None, None, None]:
    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)
    yield
    SQLModel.metadata.drop_all(engine)


def test_create_and_list_items():
    client = TestClient(app)
    payload = {"label": "Sportswear", "color": "blue", "status": "washing"}
    r = client.post("/api/laundry/", json=payload)
    assert r.status_code == 201
    created = r.json()
    assert created["label"] == "Sportswear"
    assert created["status"] == "washing"

    list_resp = client.get("/api/laundry/")
    assert list_resp.status_code == 200
    items = list_resp.json()
    assert len(items) == 1
    assert items[0]["label"] == "Sportswear"


def test_update_status_and_prevent_duplicate_tags():
    client = TestClient(app)
    first = client.post("/api/laundry/", json={"label": "Towels", "tag_id": "tag-1"})
    second = client.post("/api/laundry/", json={"label": "Bedding", "tag_id": "tag-2"})
    assert first.status_code == 201
    assert second.status_code == 201
    item_id = first.json()["id"]

    update = client.patch(f"/api/laundry/{item_id}", json={"status": "drying"})
    assert update.status_code == 200
    assert update.json()["status"] == "drying"

    dup = client.patch(f"/api/laundry/{item_id}", json={"tag_id": "tag-2"})
    assert dup.status_code == 400



def test_delete_missing_item():
    client = TestClient(app)
    resp = client.delete("/api/laundry/999")
    assert resp.status_code == 404
