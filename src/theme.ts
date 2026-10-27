export const colors = {
  bg: '#F3F5F8',
  surface: '#FFFFFF',
  ink: '#0F172A',
  inkSoft: '#475569',
  inkMute: '#94A3B8',
  line: '#E2E8F0',
  track: '#E2E8F0',

  brand: '#D92D3F',
  brandDark: '#B01F30',
  brandTint: '#FDECEE',

  valid: '#0F7B4C',
  validTint: '#E3F4EA',
  incomplete: '#9A5B05',
  incompleteTint: '#FEF1D9',
  invalid: '#B42318',
  invalidTint: '#FDECEA',

  go: '#15803D',
  goTint: '#E3F4EA',
  info: '#1D5FA8',
  infoTint: '#E6F0FA',

  night: '#0B1220',
  nightSoft: '#1E293B',
} as const;

export const radius = { sm: 10, md: 16, lg: 24, pill: 999 } as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const shadow = {
  card: { boxShadow: '0 1px 2px rgba(15,23,42,0.06), 0 8px 24px rgba(15,23,42,0.06)' },
  lift: { boxShadow: '0 4px 12px rgba(15,23,42,0.10), 0 16px 40px rgba(15,23,42,0.10)' },
} as const;
