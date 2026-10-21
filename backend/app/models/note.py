from datetime import datetime, timezone

from sqlmodel import Field, SQLModel


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class NoteBase(SQLModel):
    """Fields shared by every Note model below."""

    title: str = Field(min_length=1, max_length=200)
    content: str = ""


class Note(NoteBase, table=True):
    """The database table. `table=True` makes SQLModel create a `note` table."""

    id: int | None = Field(default=None, primary_key=True)  # SQLite fills this in
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)


class NoteCreate(NoteBase):
    """What the client sends to create a note: just title and content."""


class NoteUpdate(SQLModel):
    """What the client sends to edit a note. Every field is optional,
    so the client can change only the title, only the content, or both."""

    title: str | None = Field(default=None, min_length=1, max_length=200)
    content: str | None = None


class NotePublic(NoteBase):
    """What the API sends back to the client."""

    id: int
    created_at: datetime
    updated_at: datetime
