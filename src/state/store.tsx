import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { EXPIRY_SECONDS } from '../domain/timer';
import { InvalidReason, MarkerReading, TestRecord, purgeExpired } from '../domain/results';
import { Lang, detectLang } from '../i18n';

export type Screen =
  | { name: 'onboarding' }
  | { name: 'main' }
  | { name: 'newTest' }
  | { name: 'instructions' }
  | { name: 'timer' }
  | { name: 'scan' }
  | { name: 'result'; id: string };

export type Tab = 'test' | 'results' | 'about';
export type Speed = 1 | 30 | 60;
export type ScanScenario = 'valid' | 'outOfRange' | 'incomplete' | 'invalid';

export const LOT_NUMBERS = ['DC-2406-A', 'DC-2407-B', 'DC-2408-C'];

export interface Draft {
  patientId: string;
  dob?: string;
  lotNumber: string;
}

export interface ActiveTest extends Draft {
  startedAt: number;
  elapsed: number;
  running: boolean;
  timerSkipped: boolean;
}

interface State {
  stack: Screen[];
  tab: Tab;
  tests: TestRecord[];
  active: ActiveTest | null;
  speed: Speed;
  scenario: ScanScenario;
  lang: Lang;
}

type Action =
  | { type: 'setLang'; lang: Lang }
  | { type: 'push'; screen: Screen }
  | { type: 'back' }
  | { type: 'reset'; screen: Screen }
  | { type: 'setTab'; tab: Tab }
  | { type: 'begin'; draft: Draft }
  | { type: 'startTimer' }
  | { type: 'tick'; dt: number }
  | { type: 'skipTimer' }
  | { type: 'recordScan' }
  | { type: 'recordTimeout' }
  | { type: 'setSpeed'; speed: Speed }
  | { type: 'setScenario'; scenario: ScanScenario };

const DAY = 24 * 60 * 60 * 1000;
const MIN = 60 * 1000;

function seed(now: number): TestRecord[] {
  const base = (id: string, patientId: string, ageMs: number, lot: string) => ({
    id,
    patientId,
    lotNumber: lot,
    startedAt: now - ageMs - 15 * MIN,
    scannedAt: now - ageMs,
    timerSkipped: false,
  });
  return [
    { ...base('s1', 'PT-0417', 2 * 60 * MIN, 'DC-2408-C'), ntProBnp: { valid: true, value: 3480 }, hFabp: { valid: true, value: 42 } },
    { ...base('s2', 'PT-0416', 1 * DAY + 3 * 60 * MIN, 'DC-2408-C'), ntProBnp: { valid: true, value: 2350 }, hFabp: { valid: false } },
    {
      ...base('s3', 'PT-0409', 4 * DAY, 'DC-2407-B'),
      timerSkipped: true,
      ntProBnp: { valid: false } as MarkerReading,
      hFabp: { valid: false } as MarkerReading,
      invalidReason: 'technical' as InvalidReason,
    },
    { ...base('s4', 'PT-0388', 28 * DAY, 'DC-2406-A'), ntProBnp: { valid: true, value: 1500 }, hFabp: { valid: true, value: 150 } },
  ];
}

function readingsFor(scenario: ScanScenario): {
  ntProBnp: MarkerReading;
  hFabp: MarkerReading;
  invalidReason?: InvalidReason;
} {
  switch (scenario) {
    case 'valid':
      return { ntProBnp: { valid: true, value: 3480 }, hFabp: { valid: true, value: 42 } };
    case 'outOfRange':
      return { ntProBnp: { valid: true, value: 1500 }, hFabp: { valid: true, value: 150 } };
    case 'incomplete':
      return { ntProBnp: { valid: true, value: 2350 }, hFabp: { valid: false } };
    case 'invalid':
      return { ntProBnp: { valid: false }, hFabp: { valid: false }, invalidReason: 'technical' };
  }
}

function initialState(): State {
  const now = Date.now();
  return {
    stack: [{ name: 'onboarding' }],
    tab: 'test',
    tests: purgeExpired(seed(now), now),
    active: null,
    speed: 1,
    scenario: 'valid',
    lang: detectLang(),
  };
}

function withResult(state: State, record: TestRecord): State {
  return {
    ...state,
    tests: [record, ...state.tests],
    active: null,
    tab: 'results',
    stack: [{ name: 'main' }, { name: 'result', id: record.id }],
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'push':
      return { ...state, stack: [...state.stack, action.screen] };
    case 'back':
      return state.stack.length > 1 ? { ...state, stack: state.stack.slice(0, -1) } : state;
    case 'reset':
      return { ...state, stack: [action.screen] };
    case 'setTab':
      return { ...state, tab: action.tab };
    case 'begin':
      return {
        ...state,
        active: { ...action.draft, startedAt: Date.now(), elapsed: 0, running: false, timerSkipped: false },
        stack: [...state.stack, { name: 'instructions' }],
      };
    case 'startTimer':
      if (!state.active) return state;
      return {
        ...state,
        active: { ...state.active, running: true, startedAt: Date.now(), elapsed: 0 },
        stack: [{ name: 'main' }, { name: 'timer' }],
      };
    case 'tick':
      if (!state.active?.running) return state;
      return {
        ...state,
        active: { ...state.active, elapsed: Math.min(EXPIRY_SECONDS, state.active.elapsed + action.dt * state.speed) },
      };
    case 'skipTimer':
      return state.active ? { ...state, active: { ...state.active, timerSkipped: true } } : state;
    case 'recordScan': {
      if (!state.active) return state;
      const { patientId, dob, lotNumber, elapsed, timerSkipped } = state.active;
      const now = Date.now();
      const record: TestRecord = {
        id: `t-${now}`,
        patientId,
        dob,
        lotNumber,
        // Back-dated by the simulated elapsed time so demo speed does not skew the timestamps.
        startedAt: now - elapsed * 1000,
        scannedAt: now,
        timerSkipped,
        ...readingsFor(state.scenario),
      };
      return withResult(state, record);
    }
    case 'recordTimeout': {
      if (!state.active) return state;
      const { patientId, dob, lotNumber, elapsed } = state.active;
      const now = Date.now();
      const record: TestRecord = {
        id: `t-${now}`,
        patientId,
        dob,
        lotNumber,
        startedAt: now - elapsed * 1000,
        scannedAt: now,
        timerSkipped: false,
        ntProBnp: { valid: false },
        hFabp: { valid: false },
        invalidReason: 'timedOut',
      };
      return withResult(state, record);
    }
    case 'setLang':
      return { ...state, lang: action.lang };
    case 'setSpeed':
      return { ...state, speed: action.speed };
    case 'setScenario':
      return { ...state, scenario: action.scenario };
  }
}

interface Api {
  state: State;
  top: Screen;
  push: (screen: Screen) => void;
  back: () => void;
  reset: (screen: Screen) => void;
  setTab: (tab: Tab) => void;
  begin: (draft: Draft) => void;
  startTimer: () => void;
  skipTimer: () => void;
  recordScan: () => void;
  recordTimeout: () => void;
  setSpeed: (speed: Speed) => void;
  setScenario: (scenario: ScanScenario) => void;
  setLang: (lang: Lang) => void;
}

const AppContext = createContext<Api | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const running = state.active?.running ?? false;

  useEffect(() => {
    if (!running) return;
    let last = Date.now();
    const id = setInterval(() => {
      const now = Date.now();
      dispatch({ type: 'tick', dt: (now - last) / 1000 });
      last = now;
    }, 250);
    return () => clearInterval(id);
  }, [running]);

  const api = useMemo<Api>(
    () => ({
      state,
      top: state.stack[state.stack.length - 1],
      push: (screen) => dispatch({ type: 'push', screen }),
      back: () => dispatch({ type: 'back' }),
      reset: (screen) => dispatch({ type: 'reset', screen }),
      setTab: (tab) => dispatch({ type: 'setTab', tab }),
      begin: (draft) => dispatch({ type: 'begin', draft }),
      startTimer: () => dispatch({ type: 'startTimer' }),
      skipTimer: () => dispatch({ type: 'skipTimer' }),
      recordScan: () => dispatch({ type: 'recordScan' }),
      recordTimeout: () => dispatch({ type: 'recordTimeout' }),
      setSpeed: (speed) => dispatch({ type: 'setSpeed', speed }),
      setScenario: (scenario) => dispatch({ type: 'setScenario', scenario }),
      setLang: (lang) => dispatch({ type: 'setLang', lang }),
    }),
    [state],
  );

  return <AppContext.Provider value={api}>{children}</AppContext.Provider>;
}

export function useApp(): Api {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
