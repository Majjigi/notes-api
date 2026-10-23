import { DatePipe } from '@angular/common';
import {
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';

import { Note, NoteUpdate } from '../../models/note.model';
import { RelativeTimePipe } from '../../pipes/relative-time.pipe';
import { ClockService } from '../../services/clock.service';
import { ConfirmService } from '../../services/confirm.service';
import { describeError } from '../../services/notes-api.service';
import { NotesStoreService } from '../../services/notes-store.service';
import { ToastService } from '../../services/toast.service';
import { IconComponent } from '../icon/icon.component';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

/** How long to wait after the last keystroke before saving. */
const AUTOSAVE_DELAY_MS = 600;

/** Shows one note and saves changes automatically while you type. Route: /notes/:id */
@Component({
  selector: 'app-note-editor',
  imports: [DatePipe, RouterLink, IconComponent, RelativeTimePipe],
  templateUrl: './note-editor.component.html',
  styleUrl: './note-editor.component.scss',
  host: {
    '(document:keydown)': 'onKeydown($event)',
    '(window:beforeunload)': 'onBeforeUnload($event)',
  },
})
export class NoteEditorComponent {
  /** The :id from the URL. Filled in by the router (see withComponentInputBinding in app.config.ts). */
  readonly id = input.required<string>();

  protected readonly store = inject(NotesStoreService);
  protected readonly clock = inject(ClockService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly pageTitle = inject(Title);
  private readonly injector = inject(Injector);

  /** The note as last saved on the server. */
  protected readonly note = signal<Note | null>(null);
  /** What's in the inputs right now (may be ahead of `note` while typing). */
  protected readonly title = signal('');
  protected readonly content = signal('');
  protected readonly status = signal<SaveStatus>('idle');
  protected readonly loadError = signal<string | null>(null);

  protected readonly wordCount = computed(() => {
    const text = this.content().trim();
    return text ? text.split(/\s+/).length : 0;
  });

  private readonly titleInput = viewChild<ElementRef<HTMLInputElement>>('titleInput');

  private saveTimer?: ReturnType<typeof setTimeout>;
  /** Each save waits for the previous one, so the server always receives edits in order. */
  private saveQueue: Promise<void> = Promise.resolve();
  private latestSave = 0;

  constructor() {
    // Runs whenever the :id in the URL changes, e.g. when you click another note in the list.
    effect(() => {
      const id = Number(this.id());
      untracked(() => this.open(id));
    });

    // Keep the browser tab title in sync with the note title.
    effect(() => {
      if (this.note()) this.pageTitle.setTitle(`${this.title().trim() || 'Untitled'} · Notes`);
    });

    // Leaving the editor: save anything still waiting, and tell the list nothing is selected.
    inject(DestroyRef).onDestroy(() => {
      this.flushPendingSave();
      this.store.selectedId.set(null);
    });
  }

  private async open(id: number): Promise<void> {
    this.flushPendingSave(); // don't lose edits to the note we're leaving
    this.store.selectedId.set(id);
    this.note.set(null);
    this.loadError.set(null);
    this.status.set('idle');

    try {
      const note = await this.store.get(id);
      if (Number(this.id()) !== id) return; // the user already moved on to another note
      this.note.set(note);
      this.title.set(note.title);
      this.content.set(note.content);

      if (this.store.justCreatedId() === id) {
        this.store.justCreatedId.set(null);
        // Wait until the input is on screen, then select "Untitled" so typing replaces it.
        afterNextRender(() => this.titleInput()?.nativeElement.select(), {
          injector: this.injector,
        });
      }
    } catch (err) {
      this.loadError.set(describeError(err));
    }
  }

  // ---- Editing & autosave ------------------------------------------------------

  protected onTitleInput(value: string): void {
    this.title.set(value);
    this.scheduleSave();
  }

  protected onContentInput(value: string): void {
    this.content.set(value);
    this.scheduleSave();
  }

  /** Restart the countdown on every keystroke; save once the user pauses. */
  private scheduleSave(): void {
    this.status.set('saving');
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.save(), AUTOSAVE_DELAY_MS);
  }

  private flushPendingSave(): void {
    if (this.saveTimer !== undefined) this.save();
  }

  protected save(): void {
    clearTimeout(this.saveTimer);
    this.saveTimer = undefined;

    const note = this.note();
    if (!note) return;

    // Snapshot the values now — by the time the request goes out, the user may be on another note.
    const id = note.id;
    const changes: NoteUpdate = {
      title: this.title().trim() || 'Untitled', // the API requires a non-empty title
      content: this.content(),
    };
    const saveNumber = ++this.latestSave;
    this.status.set('saving');

    this.saveQueue = this.saveQueue.then(async () => {
      try {
        const saved = await this.store.update(id, changes);
        const isLatest = saveNumber === this.latestSave;
        if (isLatest && this.note()?.id === id) {
          this.note.set(saved);
          this.status.set('saved');
        }
      } catch (err) {
        if (this.note()?.id === id) this.status.set('error');
        this.toast.error(`Couldn't save “${changes.title}”. ${describeError(err)}`);
      }
    });
  }

  // ---- Delete --------------------------------------------------------------------

  protected async deleteNote(): Promise<void> {
    const note = this.note();
    if (!note) return;

    const confirmed = await this.confirm.ask({
      title: 'Delete this note?',
      message: `“${this.title().trim() || 'Untitled'}” will be permanently deleted. This can't be undone.`,
      confirmLabel: 'Delete note',
      tone: 'danger',
    });
    if (!confirmed) return;

    clearTimeout(this.saveTimer); // no point saving a note we're about to delete
    this.saveTimer = undefined;
    await this.saveQueue; // let any save already in flight finish first

    // On wide screens, open the next note in the list; on phones, go back to the list.
    const list = this.store.notes();
    const index = list.findIndex((n) => n.id === note.id);
    const next = list[index + 1] ?? list[index - 1];
    const isWide = window.matchMedia('(min-width: 768px)').matches;

    try {
      await this.store.remove(note.id);
      this.toast.success('Note deleted');
      await this.router.navigate(isWide && next ? ['/notes', next.id] : ['/notes']);
    } catch (err) {
      this.toast.error(`Couldn't delete the note. ${describeError(err)}`);
    }
  }

  // ---- Keyboard & page events -------------------------------------------------

  protected onKeydown(event: KeyboardEvent): void {
    // Ctrl+S / Cmd+S saves now instead of opening the browser's "Save page" dialog.
    if (event.key === 's' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      if (this.status() === 'saving' || this.status() === 'error') this.save();
    }
  }

  protected onBeforeUnload(event: BeforeUnloadEvent): void {
    // Closing the tab mid-save: start the save and ask the browser to confirm leaving.
    if (this.status() === 'saving') {
      this.flushPendingSave();
      event.preventDefault();
    }
  }
}
