from fastapi.testclient import TestClient


def create_note(client: TestClient, title: str = "Shopping", content: str = "Milk, eggs") -> dict:
    response = client.post("/api/notes/create", json={"title": title, "content": content})
    assert response.status_code == 201
    return response.json()


def test_create_note(client: TestClient):
    note = create_note(client)
    assert note["id"] is not None
    assert note["title"] == "Shopping"
    assert note["content"] == "Milk, eggs"
    assert "created_at" in note and "updated_at" in note


def test_create_note_rejects_empty_title(client: TestClient):
    response = client.post("/api/notes/create", json={"title": "", "content": "x"})
    assert response.status_code == 422


def test_list_notes(client: TestClient):
    create_note(client, title="First")
    create_note(client, title="Second")

    response = client.get("/api/notes/list")
    assert response.status_code == 200
    titles = [note["title"] for note in response.json()]
    assert sorted(titles) == ["First", "Second"]


def test_list_notes_search_matches_title_or_content(client: TestClient):
    create_note(client, title="Shopping", content="Milk, eggs")
    create_note(client, title="Ideas", content="An app for MILK lovers")
    create_note(client, title="Workout", content="Run 5k")

    response = client.get("/api/notes/list", params={"search": "milk"})
    assert response.status_code == 200
    titles = [note["title"] for note in response.json()]
    assert sorted(titles) == ["Ideas", "Shopping"]  # case doesn't matter


def test_list_notes_search_treats_wildcards_literally(client: TestClient):
    create_note(client, title="Discount", content="50% off")
    create_note(client, title="Plain", content="nothing special")

    response = client.get("/api/notes/list", params={"search": "%"})
    titles = [note["title"] for note in response.json()]
    assert titles == ["Discount"]  # "%" is not a match-everything wildcard


def test_list_notes_blank_search_returns_everything(client: TestClient):
    create_note(client, title="First")
    create_note(client, title="Second")

    response = client.get("/api/notes/list", params={"search": "   "})
    assert len(response.json()) == 2


def test_get_note(client: TestClient):
    created = create_note(client)

    response = client.get(f"/api/notes/get/{created['id']}")
    assert response.status_code == 200
    assert response.json()["title"] == "Shopping"


def test_get_missing_note_returns_404(client: TestClient):
    response = client.get("/api/notes/get/999")
    assert response.status_code == 404


def test_update_note_changes_only_sent_fields(client: TestClient):
    created = create_note(client)

    response = client.patch(f"/api/notes/update/{created['id']}", json={"title": "Groceries"})
    assert response.status_code == 200
    updated = response.json()
    assert updated["title"] == "Groceries"
    assert updated["content"] == "Milk, eggs"  # unchanged


def test_delete_note(client: TestClient):
    created = create_note(client)

    response = client.delete(f"/api/notes/delete/{created['id']}")
    assert response.status_code == 204

    response = client.get(f"/api/notes/get/{created['id']}")
    assert response.status_code == 404
