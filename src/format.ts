import { MarkerKey, MarkerReading, formatReading } from './domain/results';
import { TFn } from './i18n';

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function formatTime(ts: number): string {
  const d = new Date(ts);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatDate(ts: number, t: TFn): string {
  const d = new Date(ts);
  return `${d.getDate()} ${t('months').split(',')[d.getMonth()]} ${d.getFullYear()}`;
}

/** "Today, 14:32", "Yesterday, 09:10" or "12 Oct, 16:40" (localised). */
export function formatWhen(ts: number, now: number, t: TFn): string {
  const d = new Date(ts);
  const today = new Date(now);
  const yesterday = new Date(now - 24 * 60 * 60 * 1000);
  if (sameDay(d, today)) return `${t('today')}, ${formatTime(ts)}`;
  if (sameDay(d, yesterday)) return `${t('yesterday')}, ${formatTime(ts)}`;
  return `${d.getDate()} ${t('months').split(',')[d.getMonth()]}, ${formatTime(ts)}`;
}

/** A marker reading as text; invalid readings use the localised "no valid result" label. */
export function readingText(marker: MarkerKey, reading: MarkerReading, t: TFn): string {
  return reading.valid ? formatReading(marker, reading) : t('noValidResult');
}
