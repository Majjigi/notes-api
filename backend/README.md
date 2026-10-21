# Notes API — Backend

A Python REST API for the Notes app, built with [FastAPI](https://fastapi.tiangolo.com/).

## Project structure

```
backend/
├── app/
│   ├── main.py            # FastAPI app entry point
│   ├── core/
│   │   └── config.py      # Settings loaded from env / .env
│   └── api/
│       └── routes/
│           └── health.py  # GET /api/health
├── tests/
│   └── test_health.py
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
uvicorn app.main:app --reload
```

- API: http://localhost:8000/api/health
- Interactive docs (Swagger): http://localhost:8000/docs

## Run tests

```bash
pytest
```
