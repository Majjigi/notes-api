from typing import Annotated

from fastapi import APIRouter, HTTPException, Query, status
from sqlmodel import Session, col, select

from app.db import SessionDep
from app.models.note import Note, NoteCreate, NotePublic, NoteUpdate, utc_now

# Every route in this file starts with /notes (main.py adds /api in front).
router = APIRouter(prefix="/notes", tags=["notes"])


def get_note_or_404(session: Session, note_id: int) -> Note:
    """Look up a note by id, or stop the request with a 404 error."""
    note = session.get(Note, note_id)
    if note is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    return note


# CREATE — POST /api/notes/create
@router.post("/create", response_model=NotePublic, status_code=status.HTTP_201_CREATED)
def create_note(note_in: NoteCreate, session: SessionDep) -> Note:
    note = Note.model_validate(note_in)  # turn the request data into a table row
    session.add(note)                    # stage the new row
    session.commit()                     # save it to the database
    session.refresh(note)                # reload it so `id` and dates are filled in
    return note


# READ (all) — GET /api/notes/list
@router.get("/list", response_model=list[NotePublic])
def list_notes(
    session: SessionDep,
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 100,
) -> list[Note]:
    statement = (
        select(Note)
        .order_by(col(Note.updated_at).desc())  # most recently edited first
        .offset(offset)
        .limit(limit)
    )
    return list(session.exec(statement).all())


# READ (one) — GET /api/notes/get/{note_id}
@router.get("/get/{note_id}", response_model=NotePublic)
def get_note(note_id: int, session: SessionDep) -> Note:
    return get_note_or_404(session, note_id)


# UPDATE — PATCH /api/notes/update/{note_id}
@router.patch("/update/{note_id}", response_model=NotePublic)
def update_note(note_id: int, note_in: NoteUpdate, session: SessionDep) -> Note:
    note = get_note_or_404(session, note_id)
    # Only copy the fields the client actually sent (unsent fields are None).
    changes = note_in.model_dump(exclude_none=True)
    note.sqlmodel_update(changes)
    note.updated_at = utc_now()
    session.add(note)
    session.commit()
    session.refresh(note)
    return note


# DELETE — DELETE /api/notes/delete/{note_id}
@router.delete("/delete/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(note_id: int, session: SessionDep) -> None:
    note = get_note_or_404(session, note_id)
    session.delete(note)
    session.commit()
