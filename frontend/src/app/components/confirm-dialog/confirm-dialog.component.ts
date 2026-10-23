import { Component, ElementRef, effect, inject, viewChild } from '@angular/core';

import { ConfirmService } from '../../services/confirm.service';
import { IconComponent } from '../icon/icon.component';

/**
 * The yes/no dialog behind ConfirmService. Uses the browser's built-in <dialog>,
 * which gives us the dimmed backdrop, focus trapping and the Esc key for free.
 */
@Component({
  selector: 'app-confirm-dialog',
  imports: [IconComponent],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
})
export class ConfirmDialogComponent {
  protected readonly confirm = inject(ConfirmService);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    // Open the dialog when a question arrives, close it once it's answered.
    effect(() => {
      const dialog = this.dialog().nativeElement;
      if (this.confirm.request()) {
        if (!dialog.open) dialog.showModal();
      } else if (dialog.open) {
        dialog.close();
      }
    });
  }

  /** A click on the dialog element itself (not its contents) means the backdrop was clicked. */
  protected onDialogClick(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) {
      this.confirm.answer(false);
    }
  }
}
