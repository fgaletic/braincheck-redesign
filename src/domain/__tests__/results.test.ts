import {
  RETENTION_DAYS,
  TestRecord,
  classify,
  daysUntilDeletion,
  formatReading,
  purgeExpired,
  rangeFraction,
  rangePosition,
} from '../results';

const DAY = 24 * 60 * 60 * 1000;

function record(scannedAt: number): TestRecord {
  return {
    id: 'r',
    patientId: 'PT-0001',
    lotNumber: 'LOT-TEST',
    startedAt: scannedAt - 15 * 60 * 1000,
    scannedAt,
    timerSkipped: false,
    ntProBnp: { valid: true, value: 3000 },
    hFabp: { valid: true, value: 40 },
  };
}

// REQ-RESULT-01..05 trace to IFU sections 7.4 and 11 (see README traceability table).
describe('classification', () => {
  it('REQ-RESULT-01: valid when both markers are valid', () => {
    expect(classify({ valid: true, value: 3000 }, { valid: true, value: 40 })).toBe('valid');
  });

  it('REQ-RESULT-02: incomplete when exactly one marker is valid', () => {
    expect(classify({ valid: true, value: 3000 }, { valid: false })).toBe('incomplete');
    expect(classify({ valid: false }, { valid: true, value: 40 })).toBe('incomplete');
  });

  it('REQ-RESULT-03: invalid when neither marker is valid', () => {
    expect(classify({ valid: false }, { valid: false })).toBe('invalid');
  });
});

describe('formatting', () => {
  it('REQ-RESULT-04: shows limits instead of numbers outside the measuring range', () => {
    expect(formatReading('ntProBnp', { valid: true, value: 1500 })).toBe('<2000 pg/mL');
    expect(formatReading('ntProBnp', { valid: true, value: 9000 })).toBe('>6500 pg/mL');
    expect(formatReading('hFabp', { valid: true, value: 4 })).toBe('<9 ng/mL');
    expect(formatReading('hFabp', { valid: true, value: 200 })).toBe('>120 ng/mL');
  });

  it('shows in-range values with the right unit', () => {
    expect(formatReading('ntProBnp', { valid: true, value: 3480.4 })).toBe('3480 pg/mL');
    expect(formatReading('hFabp', { valid: true, value: 42 })).toBe('42 ng/mL');
  });

  it('says so when a marker has no valid result', () => {
    expect(formatReading('hFabp', { valid: false })).toBe('No valid result');
  });
});

describe('range helpers', () => {
  it('classifies a value against the measuring range', () => {
    expect(rangePosition('ntProBnp', 1000)).toBe('below');
    expect(rangePosition('ntProBnp', 4000)).toBe('within');
    expect(rangePosition('ntProBnp', 7000)).toBe('above');
  });

  it('clamps the gauge position to 0..1', () => {
    expect(rangeFraction('ntProBnp', 0)).toBe(0);
    expect(rangeFraction('ntProBnp', 4250)).toBeCloseTo(0.5);
    expect(rangeFraction('ntProBnp', 99999)).toBe(1);
  });
});

describe('retention', () => {
  const now = Date.UTC(2026, 9, 21);

  it('REQ-RESULT-05: deletes results after 30 days', () => {
    const fresh = record(now - 1 * DAY);
    const old = record(now - (RETENTION_DAYS + 1) * DAY);
    expect(purgeExpired([fresh, old], now)).toEqual([fresh]);
  });

  it('counts days until deletion', () => {
    expect(daysUntilDeletion(record(now), now)).toBe(RETENTION_DAYS);
    expect(daysUntilDeletion(record(now - 28 * DAY), now)).toBe(2);
    expect(daysUntilDeletion(record(now - 40 * DAY), now)).toBe(0);
  });
});
