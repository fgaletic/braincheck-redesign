import {
  EXPIRY_SECONDS,
  INCUBATION_SECONDS,
  canScan,
  formatClock,
  getPhase,
  phaseProgress,
  secondsRemaining,
} from '../timer';

// REQ-TIMER-01..05 trace to IFU section 7.3 (see README traceability table).
describe('timer phases', () => {
  it('REQ-TIMER-01: incubates for the first 13 minutes', () => {
    expect(getPhase(0)).toBe('incubating');
    expect(getPhase(12 * 60 + 59)).toBe('incubating');
  });

  it('REQ-TIMER-02: warns during the last 2 minutes of incubation', () => {
    expect(getPhase(13 * 60)).toBe('warning');
    expect(getPhase(INCUBATION_SECONDS - 1)).toBe('warning');
  });

  it('REQ-TIMER-03: scan window is open between 15 and 20 minutes', () => {
    expect(getPhase(INCUBATION_SECONDS)).toBe('scanReady');
    expect(getPhase(EXPIRY_SECONDS - 1)).toBe('scanReady');
  });

  it('REQ-TIMER-04: expires at 20 minutes', () => {
    expect(getPhase(EXPIRY_SECONDS)).toBe('expired');
    expect(getPhase(EXPIRY_SECONDS + 600)).toBe('expired');
  });
});

describe('scan availability', () => {
  it('only allows scanning inside the window', () => {
    expect(canScan(5 * 60, false)).toBe(false);
    expect(canScan(14 * 60, false)).toBe(false);
    expect(canScan(16 * 60, false)).toBe(true);
    expect(canScan(21 * 60, false)).toBe(false);
  });

  it('REQ-TIMER-05: skipping the timer unlocks scanning immediately', () => {
    expect(canScan(10, true)).toBe(true);
  });
});

describe('display helpers', () => {
  it('shows time to end of incubation, then time left to scan', () => {
    expect(secondsRemaining(0)).toBe(15 * 60);
    expect(secondsRemaining(15 * 60)).toBe(5 * 60);
    expect(secondsRemaining(EXPIRY_SECONDS)).toBe(0);
  });

  it('reports progress per phase', () => {
    expect(phaseProgress(0)).toBe(0);
    expect(phaseProgress(INCUBATION_SECONDS)).toBe(0);
    expect(phaseProgress(INCUBATION_SECONDS + 150)).toBeCloseTo(0.5);
    expect(phaseProgress(EXPIRY_SECONDS)).toBe(1);
  });

  it('formats the clock', () => {
    expect(formatClock(0)).toBe('0:00');
    expect(formatClock(90)).toBe('1:30');
    expect(formatClock(900)).toBe('15:00');
    expect(formatClock(-5)).toBe('0:00');
  });
});
