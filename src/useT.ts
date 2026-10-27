import { useMemo } from 'react';
import { TFn, makeT } from './i18n';
import { useApp } from './state/store';

export function useT(): TFn {
  const { state } = useApp();
  return useMemo(() => makeT(state.lang), [state.lang]);
}
