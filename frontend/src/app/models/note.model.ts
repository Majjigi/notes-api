/** A note as the API sends it. Mirrors `NotePublic` in backend/app/models/note.py. */
export interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string; // ISO date, e.g. "2026-10-22T17:45:46Z"
  updated_at: string;
}

/** Body for POST /api/notes/create. Mirrors `NoteCreate`. */
export interface NoteCreate {
  title: string;
  content?: string;
}

/** Body for PATCH /api/notes/update/{id}. Every field is optional. Mirrors `NoteUpdate`. */
export interface NoteUpdate {
  title?: string;
  content?: string;
}
