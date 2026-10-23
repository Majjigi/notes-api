import { Pipe, PipeTransform } from '@angular/core';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Turns a date into "Just now", "5 min ago", "Yesterday", "Mar 4" ...
 *
 * Pass the current time as the argument so the label refreshes as time passes:
 *   {{ note.updated_at | relativeTime: clock.now() }}
 */
@Pipe({ name: 'relativeTime' })
export class RelativeTimePipe implements PipeTransform {
  transform(value: string | Date, now: number = Date.now()): string {
    return relativeTime(value, now);
  }
}

export function relativeTime(value: string | Date, now: number): string {
  const date = new Date(value);
  const elapsed = now - date.getTime();

  if (elapsed < MINUTE) return 'Just now';
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)} min ago`;
  if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)} hr ago`;
  if (elapsed < 2 * DAY) return 'Yesterday';
  if (elapsed < 7 * DAY) return `${Math.floor(elapsed / DAY)} days ago`;

  const sameYear = date.getFullYear() === new Date(now).getFullYear();
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: sameYear ? undefined : 'numeric',
  });
}
