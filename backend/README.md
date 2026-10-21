# Notes API — Backend

A Python REST API for the Notes app, built with [FastAPI](https://fastapi.tiangolo.com/) and
[SQLModel](https://sqlmodel.tiangolo.com/) on top of a SQLite database.

## Project structure

```
backend/
├── app/
│   ├── main.py            # FastAPI app entry point (creates tables on startup)
│   ├── db.py              # Database engine + per-request session
│   ├── core/
│   │   └── config.py      # Settings loaded from env / .env
│   ├── models/
│   │   └── note.py        # Note table + request/response shapes
│   └── api/
│       └── routes/
│           ├── health.py  # GET /api/health
│           └── notes.py   # CRUD for /api/notes
├── tests/
│   ├── conftest.py        # Test setup: in-memory database
│   ├── test_health.py
│   └── test_notes.py
├── requirements.txt       # Runtime dependencies
├── requirements-dev.txt   # Dev/test dependencies
└── .env.example           # Sample environment variables
```

## Setup

Requires Python 3.10+. On Windows, use `py` instead of `python` if `python` isn't on your PATH.

```bash
# Create and activate a virtual environment
python -m venv .venv
# Windows (PowerShell)
.venv\Scripts\Activate.ps1
# macOS / Linux
source .venv/bin/activate

# Install dependencies
pip install -r requirements-dev.txt

# Create your local env file
cp .env.example .env
```

## Run the server

```bash
uvicorn app.main:app --reload --reload-dir app
```

`--reload-dir app` restarts the server only when your own code changes (not when packages in
`.venv` change). The SQLite database file `notes.db` is created automatically on first start.

> **Windows note:** if the log says `Reloading...` but your change doesn't show up (no
> `Application startup complete` line follows), the auto-reload got stuck. Press `Ctrl+C` and
> start the server again. Changes to `.env` always need a manual restart.

- Interactive docs (Swagger): http://localhost:8000/docs — try every endpoint from the browser

## API endpoints

| Method   | URL                         | What it does                                          | Success code |
| -------- | --------------------------- | ----------------------------------------------------- | ------------ |
| `GET`    | `/api/health`               | Check the server is running                           | 200          |
| `POST`   | `/api/notes/create`         | Create a note (`{"title": "...", "content": "..."}`)  | 201          |
| `GET`    | `/api/notes/list`           | List notes, newest edit first (`?offset=0&limit=100`) | 200          |
| `GET`    | `/api/notes/get/{id}`       | Get one note                                          | 200          |
| `PATCH`  | `/api/notes/update/{id}`    | Update title and/or content                           | 200          |
| `DELETE` | `/api/notes/delete/{id}`    | Delete a note                                         | 204          |

A missing note returns `404`; invalid input (e.g. an empty title) returns `422`.

## Run tests

```bash
pytest
```

Tests use a temporary in-memory database, so they never touch `notes.db`.
