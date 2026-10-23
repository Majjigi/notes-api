import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { Note, NoteUpdate } from '../models/note.model';
import { NotesApiService, describeError } from './notes-api.service';

/**
 * The single source of truth for notes on screen. Components read its signals
 * and call its methods; it calls NotesApiService and keeps the list up to date.
 */
@Injectable({ providedIn: 'root' })
export class NotesStoreService {
  private readonly api = inject(NotesApiService);

  // ---- State -----------------------------------------------------------------
  readonly notes = signal<Note[]>([]);
  readonly loading = signal(false);
  /** False until the first list arrives — used to show loading placeholders. */
  readonly loaded = signal(false);
  readonly error = signal<string | null>(null);
  readonly search = signal('');
  /** The note open in the editor, or null. */
  readonly selectedId = signal<number | null>(null);
  /** Set right after "New note" so the editor knows to focus the title. */
  readonly justCreatedId = signal<number | null>(null);

  readonly count = computed(() => this.notes().length);

  private latestLoad = 0;
  private searchTimer?: ReturnType<typeof setTimeout>;

  // ---- Actions ---------------------------------------------------------------

  async load(): Promise<void> {
    // Number each request so a slow, older search can't overwrite a newer one.
    const thisLoad = ++this.latestLoad;
    this.loading.set(true);
    this.error.set(null);
    try {
      const notes = await firstValueFrom(this.api.list(this.search()));
      if (thisLoad !== this.latestLoad) return;
      this.notes.set(notes);
      this.loaded.set(true);
    } catch (err) {
      if (thisLoad === this.latestLoad) this.error.set(describeError(err));
    } finally {
      if (thisLoad === this.latestLoad) this.loading.set(false);
    }
  }

  /** Update the search text, and reload once the user pauses typing. */
  setSearch(term: string): void {
    this.search.set(term);
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.load(), 250);
  }

  async create(): Promise<Note> {
    const note = await firstValueFrom(this.api.create({ title: 'Untitled', content: '' }));
    if (this.search()) {
      // Clear the search so the new note is visible in the list.
      clearTimeout(this.searchTimer);
      this.search.set('');
      void this.load();
    }
    this.notes.update((list) => [note, ...list]);
    this.justCreatedId.set(note.id);
    return note;
  }

  /** Use the copy we already have if possible; otherwise ask the server. */
  async get(id: number): Promise<Note> {
    const cached = this.notes().find((note) => note.id === id);
    return cached ?? firstValueFrom(this.api.get(id));
  }

  async update(id: number, changes: NoteUpdate): Promise<Note> {
    const saved = await firstValueFrom(this.api.update(id, changes));
    // The list is "most recently edited first", so the saved note moves to the top.
    this.notes.update((list) =>
      list.some((note) => note.id === id)
        ? [saved, ...list.filter((note) => note.id !== id)]
        : list,
    );
    return saved;
  }

  async remove(id: number): Promise<void> {
    await firstValueFrom(this.api.delete(id));
    this.notes.update((list) => list.filter((note) => note.id !== id));
  }
}
