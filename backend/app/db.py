from collections.abc import Generator
from typing import Annotated

from fastapi import Depends
from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

# The engine is the app's single connection point to the database.
# check_same_thread=False is a SQLite-only setting that lets FastAPI
# use the same database from different threads.
engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False},
)


def create_db_and_tables() -> None:
    """Create every table defined with `table=True` (skips ones that already exist)."""
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """Open a database session for one request, and close it when the request ends."""
    with Session(engine) as session:
        yield session


# Shortcut: writing `session: SessionDep` in a route makes FastAPI call
# get_session() and pass the result in automatically.
SessionDep = Annotated[Session, Depends(get_session)]
