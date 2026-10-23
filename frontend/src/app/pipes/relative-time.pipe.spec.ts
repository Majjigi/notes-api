import { relativeTime } from './relative-time.pipe';

describe('relativeTime', () => {
  const now = new Date('2026-10-22T12:00:00Z').getTime();
  const ago = (ms: number) => new Date(now - ms).toISOString();

  const MINUTE = 60_000;
  const HOUR = 60 * MINUTE;
  const DAY = 24 * HOUR;

  it('says "Just now" for the last minute', () => {
    expect(relativeTime(ago(20_000), now)).toBe('Just now');
  });

  it('counts minutes, hours and days', () => {
    expect(relativeTime(ago(5 * MINUTE), now)).toBe('5 min ago');
    expect(relativeTime(ago(3 * HOUR), now)).toBe('3 hr ago');
    expect(relativeTime(ago(30 * HOUR), now)).toBe('Yesterday');
    expect(relativeTime(ago(4 * DAY), now)).toBe('4 days ago');
  });

  it('shows a date for anything older than a week', () => {
    expect(relativeTime(ago(30 * DAY), now)).not.toContain('ago');
  });
});
