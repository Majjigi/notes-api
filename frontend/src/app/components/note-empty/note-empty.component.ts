import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { describeError } from '../../services/notes-api.service';
import { NotesStoreService } from '../../services/notes-store.service';
import { ToastService } from '../../services/toast.service';
import { IconComponent } from '../icon/icon.component';

/** What the right-hand side shows when no note is open. Route: /notes */
@Component({
  selector: 'app-note-empty',
  imports: [IconComponent],
  templateUrl: './note-empty.component.html',
  styleUrl: './note-empty.component.scss',
})
export class NoteEmptyComponent {
  protected readonly store = inject(NotesStoreService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly creating = signal(false);

  protected async createNote(): Promise<void> {
    this.creating.set(true);
    try {
      const note = await this.store.create();
      await this.router.navigate(['/notes', note.id]);
    } catch (err) {
      this.toast.error(describeError(err));
    } finally {
      this.creating.set(false);
    }
  }
}
