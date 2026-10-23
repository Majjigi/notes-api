import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { Note, NoteCreate, NoteUpdate } from '../models/note.model';

/**
 * Talks to the FastAPI backend — one method per endpoint, nothing else.
 * (State and UI logic live in NotesStoreService.)
 */
@Injectable({ providedIn: 'root' })
export class NotesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/notes`;

  /** GET /api/notes/list — newest edit first, optionally filtered by `search`. */
  list(search = ''): Observable<Note[]> {
    let params = new HttpParams().set('limit', 100);
    if (search.trim()) {
      params = params.set('search', search.trim());
    }
    return this.http.get<Note[]>(`${this.baseUrl}/list`, { params });
  }

  /** GET /api/notes/get/{id} */
  get(id: number): Observable<Note> {
    return this.http.get<Note>(`${this.baseUrl}/get/${id}`);
  }

  /** POST /api/notes/create */
  create(note: NoteCreate): Observable<Note> {
    return this.http.post<Note>(`${this.baseUrl}/create`, note);
  }

  /** PATCH /api/notes/update/{id} — only the fields you send are changed. */
  update(id: number, changes: NoteUpdate): Observable<Note> {
    return this.http.patch<Note>(`${this.baseUrl}/update/${id}`, changes);
  }

  /** DELETE /api/notes/delete/{id} */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/${id}`);
  }
}

/** Turns an HTTP failure into a sentence a person can act on. */
export function describeError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) return `Can't reach the server. Is the backend running at ${environment.apiUrl}?`;
    if (error.status === 404) return 'This note no longer exists.';
    if (error.status === 422) return 'The server rejected the note (check the title length).';
    return `The server had a problem (error ${error.status}).`;
  }
  return 'Something unexpected went wrong.';
}
