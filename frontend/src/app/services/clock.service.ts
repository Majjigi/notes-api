import { Injectable, signal } from '@angular/core';

/** The current time, refreshed every 30 seconds so labels like "2 min ago" stay correct. */
@Injectable({ providedIn: 'root' })
export class ClockService {
  readonly now = signal(Date.now());

  constructor() {
    setInterval(() => this.now.set(Date.now()), 30_000);
  }
}
