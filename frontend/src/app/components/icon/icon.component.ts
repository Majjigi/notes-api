import { Component, computed, input } from '@angular/core';

// Each icon is a list of SVG path outlines drawn on a 24×24 grid (line-icon style).
const ICONS = {
  plus: ['M12 5v14', 'M5 12h14'],
  search: ['M4 11a7 7 0 1 0 14 0a7 7 0 1 0 -14 0', 'm20 20-3.5-3.5'],
  trash: [
    'M3 6h18',
    'M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2',
    'M19 6l-.9 13.1A2 2 0 0 1 16.1 21H7.9a2 2 0 0 1-2-1.9L5 6',
    'M10 11v6',
    'M14 11v6',
  ],
  sun: [
    'M8 12a4 4 0 1 0 8 0a4 4 0 1 0 -8 0',
    'M12 2v2',
    'M12 20v2',
    'm4.93 4.93 1.41 1.41',
    'm17.66 17.66 1.41 1.41',
    'M2 12h2',
    'M20 12h2',
    'm6.34 17.66-1.41 1.41',
    'm19.07 4.93-1.41 1.41',
  ],
  moon: ['M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z'],
  monitor: ['M4 3h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z', 'M8 21h8', 'M12 17v4'],
  'chevron-left': ['m15 18-6-6 6-6'],
  check: ['M20 6 9 17l-5-5'],
  alert: ['M3 12a9 9 0 1 0 18 0a9 9 0 1 0 -18 0', 'M12 8v4', 'M12 16h.01'],
  x: ['M18 6 6 18', 'm6 6 12 12'],
  note: ['M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z', 'M14 3v5h5', 'M9 13h6', 'M9 17h4'],
  pen: ['M12 20h9', 'M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z'],
  layout: ['M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z', 'M3 9h18', 'M9 21V9'],
  refresh: [
    'M3 12a9 9 0 0 1 15.36-6.36L21 8',
    'M21 3v5h-5',
    'M21 12a9 9 0 0 1-15.36 6.36L3 16',
    'M3 21v-5h5',
  ],
  loader: ['M21 12a9 9 0 1 1-6.22-8.56'],
} satisfies Record<string, string[]>;

export type IconName = keyof typeof ICONS;
export const ICON_NAMES = Object.keys(ICONS) as IconName[];

/** <app-icon name="plus" /> — inherits the text color, so it matches whatever it sits in. */
@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss',
})
export class IconComponent {
  readonly name = input.required<IconName>();
  readonly size = input(16);
  readonly strokeWidth = input(1.75);

  protected readonly paths = computed(() => ICONS[this.name()]);
}
