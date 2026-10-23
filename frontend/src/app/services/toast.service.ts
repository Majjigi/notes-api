import { Injectable, signal } from '@angular/core';

export type ToastTone = 'neutral' | 'success' | 'danger';

export interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

/** Small pop-up messages at the bottom of the screen. Shown by <app-toaster> in app.component.html. */
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private nextId = 1;

  show(message: string, tone: ToastTone = 'neutral', durationMs = 4000): void {
    const toast: Toast = { id: this.nextId++, message, tone };
    // Keep at most 3 on screen; the oldest goes first.
    this.toasts.update((list) => [...list.slice(-2), toast]);
    setTimeout(() => this.dismiss(toast.id), durationMs);
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'danger', 6000);
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((toast) => toast.id !== id));
  }
}
