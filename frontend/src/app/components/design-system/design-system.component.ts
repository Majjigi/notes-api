import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ConfirmService } from '../../services/confirm.service';
import { ThemeService } from '../../services/theme.service';
import { ToastService } from '../../services/toast.service';
import { ICON_NAMES, IconComponent } from '../icon/icon.component';

/** A living style guide: every token and component, rendered with the real CSS. Route: /design-system */
@Component({
  selector: 'app-design-system',
  imports: [RouterLink, IconComponent],
  templateUrl: './design-system.component.html',
  styleUrl: './design-system.component.scss',
})
export class DesignSystemComponent {
  protected readonly theme = inject(ThemeService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  protected readonly semanticColors = [
    { token: '--color-bg', use: 'Page background' },
    { token: '--color-canvas', use: 'Writing surface' },
    { token: '--color-sidebar', use: 'Sidebar' },
    { token: '--color-surface', use: 'Cards, inputs' },
    { token: '--color-border', use: 'Dividers' },
    { token: '--color-text', use: 'Body text' },
    { token: '--color-text-muted', use: 'Secondary text' },
    { token: '--color-accent', use: 'Primary actions' },
    { token: '--color-accent-soft', use: 'Accent tint' },
    { token: '--color-success', use: 'Success' },
    { token: '--color-warning', use: 'Warning' },
    { token: '--color-danger', use: 'Destructive' },
  ];

  protected readonly palettes = [
    { name: 'Paper', prefix: '--paper-', steps: [0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
    { name: 'Ink', prefix: '--ink-', steps: [50, 100, 200, 300, 400, 500, 600, 700, 900] },
  ];

  protected readonly typeScale = [
    { token: '--text-3xl', name: 'Display', px: 42, display: true },
    { token: '--text-2xl', name: 'Heading', px: 30, display: true },
    { token: '--text-xl', name: 'Title', px: 22, display: false },
    { token: '--text-lg', name: 'Reading', px: 17, display: false },
    { token: '--text-md', name: 'Body', px: 15, display: false },
    { token: '--text-sm', name: 'Small', px: 13, display: false },
    { token: '--text-xs', name: 'Caption', px: 12, display: false },
  ];

  protected readonly spacing = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16];
  protected readonly radii = ['sm', 'md', 'lg', 'xl', 'full'];
  protected readonly shadows = ['xs', 'sm', 'md', 'lg'];
  protected readonly icons = ICON_NAMES;

  protected showToast(tone: 'neutral' | 'success' | 'danger'): void {
    const messages = {
      neutral: 'Heads up — this is a neutral toast.',
      success: 'Note saved',
      danger: "Couldn't reach the server.",
    };
    this.toast.show(messages[tone], tone);
  }

  protected async showDialog(): Promise<void> {
    const confirmed = await this.confirm.ask({
      title: 'Delete this note?',
      message: '“Shopping list” will be permanently deleted. This can’t be undone.',
      confirmLabel: 'Delete note',
      tone: 'danger',
    });
    this.toast.show(confirmed ? 'You chose Delete' : 'You chose Cancel');
  }
}
