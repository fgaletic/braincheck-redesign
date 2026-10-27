// Timing rules taken from the public BRAINCheck IFU (ABC-IFU-001 v1.0, section 7.3):
// 15 min incubation, timer turns red 2 min before the end, scan button active for 5 min after,
// then the cassette must be discarded.
export const INCUBATION_SECONDS = 15 * 60;
export const WARNING_SECONDS = 2 * 60;
export const SCAN_WINDOW_SECONDS = 5 * 60;
export const EXPIRY_SECONDS = INCUBATION_SECONDS + SCAN_WINDOW_SECONDS;

export type TimerPhase = 'incubating' | 'warning' | 'scanReady' | 'expired';

export function getPhase(elapsedSeconds: number): TimerPhase {
  if (elapsedSeconds >= EXPIRY_SECONDS) return 'expired';
  if (elapsedSeconds >= INCUBATION_SECONDS) return 'scanReady';
  if (elapsedSeconds >= INCUBATION_SECONDS - WARNING_SECONDS) return 'warning';
  return 'incubating';
}

/** Skipping the timer unlocks scanning immediately; the result is flagged as a deviation. */
export function canScan(elapsedSeconds: number, timerSkipped: boolean): boolean {
  if (timerSkipped) return true;
  return getPhase(elapsedSeconds) === 'scanReady';
}

/** Seconds shown on the ring: time to the end of incubation, then time left in the scan window. */
export function secondsRemaining(elapsedSeconds: number): number {
  const phase = getPhase(elapsedSeconds);
  if (phase === 'expired') return 0;
  if (phase === 'scanReady') return Math.ceil(EXPIRY_SECONDS - elapsedSeconds);
  return Math.ceil(INCUBATION_SECONDS - elapsedSeconds);
}

/** Share of the current phase window that has elapsed, 0..1 (drives the ring). */
export function phaseProgress(elapsedSeconds: number): number {
  const phase = getPhase(elapsedSeconds);
  if (phase === 'expired') return 1;
  if (phase === 'scanReady') return (elapsedSeconds - INCUBATION_SECONDS) / SCAN_WINDOW_SECONDS;
  return elapsedSeconds / INCUBATION_SECONDS;
}

export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
