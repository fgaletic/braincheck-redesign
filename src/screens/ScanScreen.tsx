import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Button, Header, Screen, Txt } from '../components/ui';
import { Cassette } from '../components/Illustrations';
import { Key } from '../i18n';
import { useApp } from '../state/store';
import { colors, space } from '../theme';
import { useT } from '../useT';

type Stage = 'aligning' | 'locked' | 'processing';

const FRAME_W = 300;
const FRAME_H = 196;

const headings: Record<Stage, { title: Key; sub: Key }> = {
  aligning: { title: 'scanAlign', sub: 'scanAlignSub' },
  locked: { title: 'scanHold', sub: 'scanHoldSub' },
  processing: { title: 'scanReading', sub: 'scanReadingSub' },
};

/**
 * Mock camera: no real capture or image analysis. Shows the alignment grid turning green
 * and the result being produced, as described in IFU section 7.3.
 */
export function ScanScreen() {
  const { back, recordScan } = useApp();
  const t = useT();
  const [stage, setStage] = useState<Stage>('aligning');
  // The store API changes on every timer tick, so keep the latest callback in a ref and run the sequence once.
  const recordScanRef = useRef(recordScan);
  recordScanRef.current = recordScan;

  useEffect(() => {
    const t1 = setTimeout(() => setStage('locked'), 2400);
    const t2 = setTimeout(() => setStage('processing'), 3300);
    const t3 = setTimeout(() => recordScanRef.current(), 4300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const locked = stage !== 'aligning';
  const accent = locked ? '#22C55E' : '#FFFFFF';
  const corner = (pos: object) => (
    <View style={[{ position: 'absolute', width: 34, height: 34, borderColor: accent }, pos]} />
  );

  return (
    <Screen background={colors.night}>
      <Header title={t('scanTitle')} onBack={back} dark />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.xl }}>
        <View style={{ width: FRAME_W + 40, height: FRAME_H + 80, borderRadius: 24, backgroundColor: '#1F2937', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <View style={{ opacity: locked ? 1 : 0.85, transform: [{ translateX: locked ? 0 : 10 }, { rotate: locked ? '0deg' : '3deg' }, { scale: locked ? 1 : 0.94 }] }}>
            <Cassette width={FRAME_W - 30} scanning={locked} />
          </View>
          <View style={{ position: 'absolute', width: FRAME_W, height: FRAME_H }}>
            {corner({ top: 0, left: 0, borderTopWidth: 5, borderLeftWidth: 5, borderTopLeftRadius: 16 })}
            {corner({ top: 0, right: 0, borderTopWidth: 5, borderRightWidth: 5, borderTopRightRadius: 16 })}
            {corner({ bottom: 0, left: 0, borderBottomWidth: 5, borderLeftWidth: 5, borderBottomLeftRadius: 16 })}
            {corner({ bottom: 0, right: 0, borderBottomWidth: 5, borderRightWidth: 5, borderBottomRightRadius: 16 })}
          </View>
          {locked ? (
            <View style={{ position: 'absolute', top: 14, right: 14, width: 36, height: 36, borderRadius: 18, backgroundColor: '#22C55E', alignItems: 'center', justifyContent: 'center' }}>
              <Feather name="check" size={22} color="#FFFFFF" />
            </View>
          ) : null}
        </View>

        <View style={{ alignItems: 'center', gap: 6, paddingHorizontal: space.xl }}>
          <Txt variant="h2" color="#FFFFFF" style={{ textAlign: 'center' }}>
            {t(headings[stage].title)}
          </Txt>
          <Txt variant="small" color="#CBD5E1" style={{ textAlign: 'center' }}>
            {t(headings[stage].sub)}
          </Txt>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center', paddingHorizontal: space.lg }}>
          {(['tipSurface', 'tipShadows', 'tipSteady'] as const).map((tip) => (
            <View key={tip} style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.12)' }}>
              <Txt variant="caption" color="#E2E8F0">
                {t(tip)}
              </Txt>
            </View>
          ))}
        </View>
      </View>
      <View style={{ padding: space.xl, gap: 10 }}>
        <Txt variant="caption" color="#94A3B8" style={{ textAlign: 'center' }}>
          {t('protoCameraNote')}
        </Txt>
        <Button label={t('cancel')} variant="onDark" onPress={back} />
      </View>
    </Screen>
  );
}
