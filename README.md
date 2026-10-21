# Notes API

A full-stack notes app.

| Folder                   | Stack                  | Docs                                       |
| ------------------------ | ---------------------- | ------------------------------------------ |
| [backend/](backend/)     | Python · FastAPI · SQLite | [backend/README.md](backend/README.md)  |
| [frontend/](frontend/)   | Angular                | [frontend/README.md](frontend/README.md)   |

## Quick start

**Backend** (http://localhost:8000):

```bash
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1        # Windows; on macOS/Linux: source .venv/bin/activate
pip install -r requirements-dev.txt
uvicorn app.main:app --reload --reload-dir app
```

**Frontend** (http://localhost:4200):

```bash
cd frontend
npm install
npm start
```

The frontend reads the backend URL from `frontend/src/environments/`.
