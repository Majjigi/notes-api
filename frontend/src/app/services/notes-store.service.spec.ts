import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import { Note } from '../models/note.model';
import { NotesStoreService } from './notes-store.service';

const base = `${environment.apiUrl}/notes`;

function makeNote(id: number, title: string): Note {
  return { id, title, content: '', created_at: '2026-10-22T10:00:00Z', updated_at: '2026-10-22T10:00:00Z' };
}

describe('NotesStoreService', () => {
  let store: NotesStoreService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(NotesStoreService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  /** Load the store with some notes, answering the list request ourselves. */
  async function loadWith(notes: Note[]): Promise<void> {
    const done = store.load();
    http.expectOne(`${base}/list?limit=100`).flush(notes);
    await done;
  }

  it('loads notes', async () => {
    expect(store.loaded()).toBe(false);
    await loadWith([makeNote(1, 'A'), makeNote(2, 'B')]);

    expect(store.loaded()).toBe(true);
    expect(store.loading()).toBe(false);
    expect(store.count()).toBe(2);
  });

  it('shows a friendly error when the server is down', async () => {
    const done = store.load();
    http.expectOne(`${base}/list?limit=100`).error(new ProgressEvent('error'), { status: 0 });
    await done;

    expect(store.error()).toContain("Can't reach the server");
    expect(store.loaded()).toBe(false);
  });

  it('adds a new note to the top and remembers it was just created', async () => {
    await loadWith([makeNote(1, 'Old')]);

    const done = store.create();
    http.expectOne(`${base}/create`).flush(makeNote(2, 'Untitled'));
    const created = await done;

    expect(created.id).toBe(2);
    expect(store.notes().map((n) => n.id)).toEqual([2, 1]);
    expect(store.justCreatedId()).toBe(2);
  });

  it('moves an updated note to the top of the list', async () => {
    await loadWith([makeNote(1, 'A'), makeNote(2, 'B'), makeNote(3, 'C')]);

    const done = store.update(3, { title: 'C2' });
    http.expectOne(`${base}/update/3`).flush(makeNote(3, 'C2'));
    await done;

    expect(store.notes().map((n) => n.title)).toEqual(['C2', 'A', 'B']);
  });

  it('removes a deleted note', async () => {
    await loadWith([makeNote(1, 'A'), makeNote(2, 'B')]);

    const done = store.remove(1);
    http.expectOne(`${base}/delete/1`).flush(null, { status: 204, statusText: 'No Content' });
    await done;

    expect(store.notes().map((n) => n.id)).toEqual([2]);
  });

  it('uses the cached copy when getting a note it already has', async () => {
    await loadWith([makeNote(1, 'A')]);
    const note = await store.get(1);
    expect(note.title).toBe('A'); // http.verify() proves no request was made
  });
});
