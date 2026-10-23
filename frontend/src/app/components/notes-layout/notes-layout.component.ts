import { Component, ElementRef, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { RelativeTimePipe } from '../../pipes/relative-time.pipe';
import { ClockService } from '../../services/clock.service';
import { describeError } from '../../services/notes-api.service';
import { NotesStoreService } from '../../services/notes-store.service';
import { ThemeService } from '../../services/theme.service';
import { ToastService } from '../../services/toast.service';
import { IconComponent } from '../icon/icon.component';

/** The main screen: sidebar with search + note list on the left, the open note on the right. */
@Component({
  selector: 'app-notes-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent, RelativeTimePipe],
  templateUrl: './notes-layout.component.html',
  styleUrl: './notes-layout.component.scss',
  host: {
    '(document:keydown)': 'onKeydown($event)',
  },
})
export class NotesLayoutComponent implements OnInit {
  protected readonly store = inject(NotesStoreService);
  protected readonly theme = inject(ThemeService);
  protected readonly clock = inject(ClockService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  private readonly searchInput = viewChild.required<ElementRef<HTMLInputElement>>('searchInput');

  protected readonly creating = signal(false);
  protected readonly skeletonRows = [1, 2, 3, 4, 5];

  protected readonly countLabel = computed(() => {
    const count = this.store.count();
    const noun = this.store.search() ? 'result' : 'note';
    return `${count} ${noun}${count === 1 ? '' : 's'}`;
  });

  ngOnInit(): void {
    void this.store.load();
  }

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

  protected clearSearch(): void {
    this.store.setSearch('');
    this.searchInput().nativeElement.focus();
  }

  /** First line of the content, for the list preview. */
  protected preview(content: string): string {
    const text = content.replace(/\s+/g, ' ').trim();
    return text || 'No additional text';
  }

  /** Keyboard shortcuts: "/" or Ctrl+K jumps to search. */
  protected onKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const isTyping = target.isContentEditable || ['INPUT', 'TEXTAREA'].includes(target.tagName);
    const isCtrlK = event.key === 'k' && (event.ctrlKey || event.metaKey);

    if (isCtrlK || (event.key === '/' && !isTyping)) {
      event.preventDefault();
      this.searchInput().nativeElement.select();
    }
  }
}
