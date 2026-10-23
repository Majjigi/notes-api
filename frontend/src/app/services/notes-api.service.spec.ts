import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import { Note } from '../models/note.model';
import { NotesApiService, describeError } from './notes-api.service';

const base = `${environment.apiUrl}/notes`;
const note: Note = {
  id: 1,
  title: 'Shopping',
  content: 'Milk',
  created_at: '2026-10-22T10:00:00Z',
  updated_at: '2026-10-22T10:00:00Z',
};

describe('NotesApiService', () => {
  let api: NotesApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(NotesApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify()); // fails if a test made a request it didn't check

  it('lists notes', () => {
    let result: Note[] = [];
    api.list().subscribe((notes) => (result = notes));

    const req = http.expectOne(`${base}/list?limit=100`);
    expect(req.request.method).toBe('GET');
    req.flush([note]);
    expect(result).toEqual([note]);
  });

  it('sends the trimmed search text, and skips blank searches', () => {
    api.list('  milk ').subscribe();
    http.expectOne(`${base}/list?limit=100&search=milk`).flush([]);

    api.list('   ').subscribe();
    http.expectOne(`${base}/list?limit=100`).flush([]);
  });

  it('gets one note', () => {
    api.get(1).subscribe();
    const req = http.expectOne(`${base}/get/1`);
    expect(req.request.method).toBe('GET');
    req.flush(note);
  });

  it('creates a note', () => {
    api.create({ title: 'Shopping', content: 'Milk' }).subscribe();
    const req = http.expectOne(`${base}/create`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ title: 'Shopping', content: 'Milk' });
    req.flush(note);
  });

  it('updates a note', () => {
    api.update(1, { title: 'Groceries' }).subscribe();
    const req = http.expectOne(`${base}/update/1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ title: 'Groceries' });
    req.flush({ ...note, title: 'Groceries' });
  });

  it('deletes a note', () => {
    api.delete(1).subscribe();
    const req = http.expectOne(`${base}/delete/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });
});

describe('describeError', () => {
  it('explains an unreachable server', () => {
    const error = new HttpErrorResponse({ status: 0 });
    expect(describeError(error)).toContain("Can't reach the server");
  });

  it('explains a missing note', () => {
    expect(describeError(new HttpErrorResponse({ status: 404 }))).toBe('This note no longer exists.');
  });
});
