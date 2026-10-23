import { Injectable, computed, effect, signal } from '@angular/core';

import { IconName } from '../components/icon/icon.component';

export type ThemePreference = 'system' | 'light' | 'dark';

// Must match the key read by the small script in src/index.html.
const STORAGE_KEY = 'notes.theme';
const CYCLE: ThemePreference[] = ['system', 'light', 'dark'];

/** Remembers whether the user wants light, dark, or "follow my OS" colors. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly preference = signal<ThemePreference>(readStoredPreference());

  readonly label = computed(() => {
    const names = { system: 'System theme', light: 'Light theme', dark: 'Dark theme' };
    return names[this.preference()];
  });

  readonly icon = computed<IconName>(() => {
    const icons = { system: 'monitor', light: 'sun', dark: 'moon' } as const;
    return icons[this.preference()];
  });

  constructor() {
    // Runs now and again whenever `preference` changes.
    effect(() => {
      const preference = this.preference();
      const root = document.documentElement;
      // The CSS in styles/_tokens.scss switches colors based on this attribute.
      if (preference === 'system') {
        root.removeAttribute('data-theme');
      } else {
        root.setAttribute('data-theme', preference);
      }
      try {
        localStorage.setItem(STORAGE_KEY, preference);
      } catch {
        // Storage can be blocked (e.g. private browsing). The theme still works for this visit.
      }
    });
  }

  /** system → light → dark → system ... */
  cycle(): void {
    const next = CYCLE[(CYCLE.indexOf(this.preference()) + 1) % CYCLE.length];
    this.preference.set(next);
  }
}

function readStoredPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // Fall through to the default.
  }
  return 'system';
}
