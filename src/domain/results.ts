// Result rules taken from the public BRAINCheck IFU (ABC-IFU-001 v1.0, sections 7.4 and 11).
// All values in this prototype are synthetic.
export type MarkerKey = 'ntProBnp' | 'hFabp';
export type OverallStatus = 'valid' | 'incomplete' | 'invalid';
export type InvalidReason = 'timedOut' | 'technical';

export type MarkerReading = { valid: true; value: number } | { valid: false };

export interface MarkerSpec {
  label: string;
  unit: string;
  /** Lower and upper limit of the measuring range. */
  min: number;
  max: number;
}

export const MARKERS: Record<MarkerKey, MarkerSpec> = {
  ntProBnp: {
    label: 'NT-proBNP',
    unit: 'pg/mL',
    min: 2000,
    max: 6500,
  },
  hFabp: {
    label: 'H-FABP',
    unit: 'ng/mL',
    min: 9,
    max: 120,
  },
};

export const RETENTION_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface TestRecord {
  id: string;
  patientId: string;
  dob?: string;
  lotNumber: string;
  startedAt: number;
  scannedAt: number;
  timerSkipped: boolean;
  ntProBnp: MarkerReading;
  hFabp: MarkerReading;
  invalidReason?: InvalidReason;
}

export function classify(ntProBnp: MarkerReading, hFabp: MarkerReading): OverallStatus {
  const validCount = Number(ntProBnp.valid) + Number(hFabp.valid);
  if (validCount === 2) return 'valid';
  if (validCount === 1) return 'incomplete';
  return 'invalid';
}

/** Out-of-range values are shown as "<min" / ">max" instead of a number, as in the IFU. */
export function formatReading(marker: MarkerKey, reading: MarkerReading): string {
  const spec = MARKERS[marker];
  if (!reading.valid) return 'No valid result';
  if (reading.value < spec.min) return `<${spec.min} ${spec.unit}`;
  if (reading.value > spec.max) return `>${spec.max} ${spec.unit}`;
  return `${Math.round(reading.value)} ${spec.unit}`;
}

export type RangePosition = 'below' | 'within' | 'above';

export function rangePosition(marker: MarkerKey, value: number): RangePosition {
  const spec = MARKERS[marker];
  if (value < spec.min) return 'below';
  if (value > spec.max) return 'above';
  return 'within';
}

/** Position of a value inside the measuring range, clamped to 0..1. */
export function rangeFraction(marker: MarkerKey, value: number): number {
  const spec = MARKERS[marker];
  const f = (value - spec.min) / (spec.max - spec.min);
  return Math.min(1, Math.max(0, f));
}

export function expiryTimestamp(record: TestRecord): number {
  return record.scannedAt + RETENTION_DAYS * DAY_MS;
}

export function daysUntilDeletion(record: TestRecord, now: number): number {
  return Math.max(0, Math.ceil((expiryTimestamp(record) - now) / DAY_MS));
}

/** Results stay on the phone for at most 30 days, then are deleted automatically. */
export function purgeExpired(records: TestRecord[], now: number): TestRecord[] {
  return records.filter((r) => expiryTimestamp(r) > now);
}
