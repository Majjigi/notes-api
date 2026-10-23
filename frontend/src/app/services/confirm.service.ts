import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  tone?: 'primary' | 'danger';
}

interface ConfirmRequest extends ConfirmOptions {
  resolve: (confirmed: boolean) => void;
}

/**
 * Asks the user a yes/no question in a modal dialog:
 *
 *   if (await confirm.ask({ title: 'Delete?', message: '...' })) { ... }
 *
 * The dialog itself is <app-confirm-dialog> in app.component.html.
 */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly request = signal<ConfirmRequest | null>(null);

  ask(options: ConfirmOptions): Promise<boolean> {
    this.request()?.resolve(false); // only one question at a time
    return new Promise((resolve) => this.request.set({ ...options, resolve }));
  }

  answer(confirmed: boolean): void {
    const request = this.request();
    if (!request) return;
    this.request.set(null);
    request.resolve(confirmed);
  }
}
