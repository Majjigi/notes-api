from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import health, notes
from app.core.config import settings
from app.db import create_db_and_tables


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Code before `yield` runs once when the server starts.
    create_db_and_tables()
    yield


app = FastAPI(title=settings.app_name, version=settings.version, lifespan=lifespan)

# Allow the Angular dev server to call the API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix=settings.api_prefix)
app.include_router(notes.router, prefix=settings.api_prefix)
