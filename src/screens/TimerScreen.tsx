import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, Vibration, View } from 'react-native';
import { Button, Callout, Card, Header, Screen, Txt } from '../components/ui';
import { TimerRing } from '../components/TimerRing';
import {
  EXPIRY_SECONDS,
  INCUBATION_SECONDS,
  TimerPhase,
  WARNING_SECONDS,
  canScan,
  getPhase,
  phaseProgress,
  secondsRemaining,
} from '../domain/timer';
import { Key } from '../i18n';
import { useApp } from '../state/store';
import { colors, radius, space } from '../theme';
import { useT } from '../useT';

const captions: Record<TimerPhase, Key> = {
  incubating: 'capIncubating',
  warning: 'capWarning',
  scanReady: 'capScanReady',
  expired: 'capExpired',
};

export function TimerScreen() {
  const { state, back, push, skipTimer, recordTimeout } = useApp();
  const t = useT();
  const active = state.active;
  const [confirmSkip, setConfirmSkip] = useState(false);
  const alerted = useRef(false);

  const elapsed = active?.elapsed ?? 0;
  const phase = getPhase(elapsed);
  const scanAllowed = !!active && canScan(elapsed, active.timerSkipped);

  useEffect(() => {
    if (phase === 'scanReady' && !alerted.current) {
      alerted.current = true;
      Vibration.vibrate([0, 500, 300, 500, 300, 500]);
    }
  }, [phase]);

  if (!active) {
    return (
      <Screen>
        <Header title={t('timerTitle')} onBack={back} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Header title={t('timerTitle')} onBack={back} />
      <ScrollView contentContainerStyle={{ padding: space.xl, gap: space.xl, alignItems: 'center' }}>
        <Card style={{ alignSelf: 'stretch', flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ gap: 2 }}>
            <Txt variant="label" color={colors.inkMute}>
              {t('patientLabel')}
            </Txt>
            <Txt variant="title">{active.patientId}</Txt>
          </View>
          <View style={{ gap: 2, alignItems: 'flex-end' }}>
            <Txt variant="label" color={colors.inkMute}>
              {t('lotLabel')}
            </Txt>
            <Txt variant="title">{active.lotNumber}</Txt>
          </View>
        </Card>

        <TimerRing
          phase={active.timerSkipped && phase !== 'scanReady' ? 'scanReady' : phase}
          progress={active.timerSkipped && phase !== 'scanReady' ? 0 : phaseProgress(elapsed)}
          seconds={secondsRemaining(elapsed)}
          caption={active.timerSkipped ? t('capSkipped') : t(captions[phase])}
        />

        <Timeline elapsed={elapsed} />

        {phase === 'incubating' && !active.timerSkipped ? (
          <Callout tone="info" icon="clock">
            {t('incubatingNote')}
          </Callout>
        ) : null}
        {phase === 'warning' && !active.timerSkipped ? (
          <Callout tone="danger" icon="bell" title={t('getReadyTitle')}>
            {t('getReadyBody')}
          </Callout>
        ) : null}
        {scanAllowed && phase !== 'expired' ? (
          <Callout tone="good" icon="bell" title={active.timerSkipped ? t('scanEarlyTitle') : t('scanNowTitle')}>
            {active.timerSkipped ? t('scanEarlyBody') : t('scanNowBody')}
          </Callout>
        ) : null}
        {phase === 'expired' && !active.timerSkipped ? (
          <Callout tone="danger" title={t('timedOutTitle')}>
            {t('timedOutBody')}
          </Callout>
        ) : null}
      </ScrollView>

      <View style={{ padding: space.xl, paddingTop: space.md, gap: 8 }}>
        {confirmSkip && !scanAllowed ? (
          <View style={{ gap: 12, padding: space.lg, borderRadius: radius.md, backgroundColor: colors.incompleteTint }}>
            <Txt variant="title" color={colors.incomplete}>
              {t('skipQuestion')}
            </Txt>
            <Txt variant="small">{t('skipWarning')}</Txt>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button label={t('keepWaiting')} variant="secondary" style={{ flex: 1, paddingHorizontal: space.md }} onPress={() => setConfirmSkip(false)} />
              <Button
                label={t('skipAnyway')}
                variant="danger"
                style={{ flex: 1, paddingHorizontal: space.md }}
                onPress={() => {
                  skipTimer();
                  setConfirmSkip(false);
                }}
              />
            </View>
          </View>
        ) : phase === 'expired' && !active.timerSkipped ? (
          <Button label={t('discardReturn')} icon="trash-2" variant="danger" onPress={recordTimeout} />
        ) : (
          <>
            <Button label={t('scanTest')} icon="camera" variant="success" disabled={!scanAllowed} onPress={() => push({ name: 'scan' })} />
            {!scanAllowed && !confirmSkip ? <Button label={t('skipTimerButton')} variant="ghost" onPress={() => setConfirmSkip(true)} /> : null}
          </>
        )}
      </View>
    </Screen>
  );
}

/** 0 to 15 min incubation, last 2 min highlighted, 15 to 20 min scan window. */
function Timeline({ elapsed }: { elapsed: number }) {
  const t = useT();
  const total = EXPIRY_SECONDS;
  const pct = (s: number) => `${(s / total) * 100}%` as const;
  const marker = Math.min(1, elapsed / total);
  return (
    <View style={{ alignSelf: 'stretch', gap: 8 }}>
      <View style={{ height: 14, borderRadius: 7, overflow: 'hidden', flexDirection: 'row', backgroundColor: colors.track }}>
        <View style={{ width: pct(INCUBATION_SECONDS - WARNING_SECONDS), backgroundColor: '#CBD5E1' }} />
        <View style={{ width: pct(WARNING_SECONDS), backgroundColor: '#F4A3AC' }} />
        <View style={{ width: pct(EXPIRY_SECONDS - INCUBATION_SECONDS), backgroundColor: '#86D3A0' }} />
        <View style={{ position: 'absolute', left: `${marker * 100}%`, top: 0, bottom: 0, width: 4, backgroundColor: colors.ink, marginLeft: -2 }} />
      </View>
      <View style={{ height: 16 }}>
        <Txt variant="caption" color={colors.inkSoft} style={{ position: 'absolute', left: 0 }}>
          {t('minutes', { n: 0 })}
        </Txt>
        <Txt variant="caption" color={colors.inkSoft} style={{ position: 'absolute', left: pct(INCUBATION_SECONDS), transform: [{ translateX: -20 }] }}>
          {t('minutes', { n: 15 })}
        </Txt>
        <Txt variant="caption" color={colors.inkSoft} style={{ position: 'absolute', right: 0 }}>
          {t('minutes', { n: 20 })}
        </Txt>
      </View>
    </View>
  );
}
