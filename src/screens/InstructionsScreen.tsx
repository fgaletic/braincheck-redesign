import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Button, Callout, Card, Header, Screen, Txt } from '../components/ui';
import { Cassette, Liquid, TubeIllustration } from '../components/Illustrations';
import { Key } from '../i18n';
import { useApp } from '../state/store';
import { colors, space } from '../theme';
import { useT } from '../useT';

interface Step {
  title: Key;
  body: Key;
  warning?: Key;
  art: React.ReactNode;
}

const filled = (left?: Liquid, right?: Liquid) => ({ left, right });

const STEPS: Step[] = [
  { title: 's1Title', body: 's1Body', warning: 's1Warn', art: <TubeIllustration /> },
  { title: 's2Title', body: 's2Body', art: <Cassette target="left" liquid="blood" count={2} /> },
  {
    title: 's3Title',
    body: 's3Body',
    warning: 's3Warn',
    art: <Cassette target="right" liquid="blood" count={2} filled={filled('blood')} />,
  },
  {
    title: 's4Title',
    body: 's4Body',
    warning: 's4Warn',
    art: <Cassette target="left" liquid="diluentA" count={4} filled={filled('blood', 'blood')} />,
  },
  {
    title: 's5Title',
    body: 's5Body',
    warning: 's5Warn',
    art: <Cassette target="right" liquid="diluentB" count={4} filled={filled('diluentA', 'blood')} />,
  },
];

export function InstructionsScreen() {
  const { back, startTimer } = useApp();
  const t = useT();
  const [index, setIndex] = useState(0);
  const step = STEPS[index];
  const last = index === STEPS.length - 1;

  return (
    <Screen>
      <Header
        title={t('stepOf', { n: index + 1, total: STEPS.length })}
        onBack={() => (index === 0 ? back() : setIndex(index - 1))}
        right={
          <Pressable accessibilityRole="button" accessibilityLabel={t('skipToTimerA11y')} onPress={startTimer} hitSlop={12}>
            <Txt variant="small" color={colors.brand} style={{ fontWeight: '700' }}>
              {t('skip')}
            </Txt>
          </Pressable>
        }
      />
      <View style={{ flexDirection: 'row', gap: 6, paddingHorizontal: space.xl }}>
        {STEPS.map((_, i) => (
          <View key={i} style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: i <= index ? colors.brand : colors.line }} />
        ))}
      </View>
      <ScrollView contentContainerStyle={{ padding: space.xl, gap: space.xl }}>
        <Card style={{ alignItems: 'center', paddingVertical: space.xl, backgroundColor: '#F8FAFC' }}>{step.art}</Card>
        <View style={{ gap: 10 }}>
          <Txt variant="h1" style={{ fontSize: 26, lineHeight: 32 }}>
            {t(step.title)}
          </Txt>
          <Txt variant="body" color={colors.inkSoft} style={{ fontSize: 18, lineHeight: 26 }}>
            {t(step.body)}
          </Txt>
        </View>
        {step.warning ? (
          <Callout tone="warn" icon="alert-triangle">
            {t(step.warning)}
          </Callout>
        ) : null}
      </ScrollView>
      <View style={{ padding: space.xl, paddingTop: space.md, gap: 10 }}>
        <Button
          label={last ? t('startTimerButton') : t('nextStep')}
          icon={last ? 'clock' : 'arrow-right'}
          onPress={() => (last ? startTimer() : setIndex(index + 1))}
        />
      </View>
    </Screen>
  );
}
