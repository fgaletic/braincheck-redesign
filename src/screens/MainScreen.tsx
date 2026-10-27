import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Button, Callout, Card, IconName, Pill, Row, Screen, StatusChip, Txt } from '../components/ui';
import { BrainMark } from '../components/Illustrations';
import { MARKERS, MarkerKey, OverallStatus, TestRecord, classify, daysUntilDeletion } from '../domain/results';
import { getPhase, formatClock, secondsRemaining } from '../domain/timer';
import { formatWhen, readingText } from '../format';
import { Key, Lang, TFn } from '../i18n';
import { ScanScenario, Speed, Tab, useApp } from '../state/store';
import { colors, radius, shadow, space } from '../theme';
import { useT } from '../useT';

export function MainScreen() {
  const { state, setTab } = useApp();
  return (
    <Screen>
      <View style={{ flex: 1 }}>
        {state.tab === 'test' ? <HomeTab /> : null}
        {state.tab === 'results' ? <ResultsTab /> : null}
        {state.tab === 'about' ? <AboutTab /> : null}
      </View>
      <TabBar tab={state.tab} onChange={setTab} />
    </Screen>
  );
}

function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const t = useT();
  const items: { key: Tab; label: Key; icon: IconName }[] = [
    { key: 'test', label: 'tabTest', icon: 'plus-circle' },
    { key: 'results', label: 'tabResults', icon: 'list' },
    { key: 'about', label: 'tabAbout', icon: 'info' },
  ];
  return (
    <View style={{ flexDirection: 'row', backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.line, paddingBottom: 4 }}>
      {items.map((item) => {
        const on = item.key === tab;
        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            onPress={() => onChange(item.key)}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 64, gap: 3 }}
          >
            <Feather name={item.icon} size={24} color={on ? colors.brand : colors.inkMute} />
            <Txt variant="caption" color={on ? colors.brand : colors.inkMute} style={{ fontWeight: '700' }}>
              {t(item.label)}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

function summary(r: TestRecord, t: TFn): string {
  if (!r.ntProBnp.valid && !r.hFabp.valid) {
    return r.invalidReason === 'timedOut' ? t('summaryTimedOut') : t('summaryTechnical');
  }
  return `NT-proBNP ${readingText('ntProBnp', r.ntProBnp, t)}  ·  H-FABP ${readingText('hFabp', r.hFabp, t)}`;
}

function ResultRow({ record, onPress }: { record: TestRecord; onPress: () => void }) {
  const t = useT();
  const now = Date.now();
  const status = classify(record.ntProBnp, record.hFabp);
  const days = daysUntilDeletion(record, now);
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
      <Card style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Txt variant="title">{record.patientId}</Txt>
          <StatusChip status={status} />
        </View>
        <Txt variant="small" color={colors.inkSoft}>
          {summary(record, t)}
        </Txt>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Txt variant="caption" color={colors.inkMute}>
            {formatWhen(record.scannedAt, now, t)}
            {record.timerSkipped ? `  ·  ${t('timerSkippedShort')}` : ''}
          </Txt>
          {days <= 7 ? (
            <Txt variant="caption" color={colors.incomplete} style={{ fontWeight: '700' }}>
              {days === 1 ? t('deletesInOne') : t('deletesInMany', { n: days })}
            </Txt>
          ) : null}
        </View>
      </Card>
    </Pressable>
  );
}

function HomeTab() {
  const { state, push } = useApp();
  const t = useT();
  const recent = state.tests.slice(0, 3);
  const active = state.active?.running ? state.active : null;
  const left = active ? secondsRemaining(active.elapsed) : 0;
  const phase = active ? getPhase(active.elapsed) : 'incubating';

  const checks: { icon: IconName; text: Key }[] = [
    { icon: 'droplet', text: 'checkSample' },
    { icon: 'camera', text: 'checkLens' },
    { icon: 'sun', text: 'checkSurface' },
  ];

  return (
    <ScrollView contentContainerStyle={{ padding: space.xl, gap: space.xl, paddingBottom: space.xxl }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <BrainMark size={40} color={colors.brand} />
        <View style={{ flex: 1 }}>
          <Txt variant="title">BRAINCheck</Txt>
          <Txt variant="caption" color={colors.inkSoft}>
            {t('conceptPrototype')}
          </Txt>
        </View>
      </View>

      {active ? (
        <Pressable accessibilityRole="button" onPress={() => push({ name: 'timer' })}>
          <View style={{ backgroundColor: colors.night, borderRadius: radius.lg, padding: space.lg, flexDirection: 'row', alignItems: 'center', gap: 14, ...shadow.lift }}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: phase === 'scanReady' ? colors.go : colors.brand, alignItems: 'center', justifyContent: 'center' }}>
              <Feather name={phase === 'scanReady' ? 'camera' : 'clock'} size={24} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Txt variant="title" color="#FFFFFF">
                {phase === 'scanReady' ? t('readyToScan') : phase === 'expired' ? t('testTimedOut') : t('testInProgress')}
              </Txt>
              <Txt variant="small" color="#CBD5E1">
                {t('patientTimeLeft', { patient: active.patientId, time: formatClock(left) })}
              </Txt>
            </View>
            <Feather name="chevron-right" size={24} color="#FFFFFF" />
          </View>
        </Pressable>
      ) : null}

      <View style={{ gap: 6 }}>
        <Txt variant="h1">{t('readyToTest')}</Txt>
        <Txt variant="body" color={colors.inkSoft}>
          {t('readyToTestSub')}
        </Txt>
      </View>

      <Button label={t('startNewTest')} icon="plus" onPress={() => push({ name: 'newTest' })} />

      <Card style={{ gap: 14 }}>
        <Txt variant="label" color={colors.inkSoft}>
          {t('beforeYouStart')}
        </Txt>
        {checks.map((c) => (
          <View key={c.text} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Feather name={c.icon} size={20} color={colors.brand} />
            <Txt variant="small" style={{ flex: 1 }}>
              {t(c.text)}
            </Txt>
          </View>
        ))}
      </Card>

      <View style={{ gap: space.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Txt variant="h2">{t('recentResults')}</Txt>
          <ViewAll />
        </View>
        {recent.map((r) => (
          <ResultRow key={r.id} record={r} onPress={() => push({ name: 'result', id: r.id })} />
        ))}
      </View>

      <DemoControls />

      <Txt variant="caption" color={colors.inkMute} style={{ textAlign: 'center' }}>
        {t('footerDisclaimer')}
      </Txt>
    </ScrollView>
  );
}

function ViewAll() {
  const { setTab } = useApp();
  const t = useT();
  return (
    <Pressable accessibilityRole="button" onPress={() => setTab('results')} hitSlop={10}>
      <Txt variant="small" color={colors.brand} style={{ fontWeight: '700' }}>
        {t('seeAll')}
      </Txt>
    </Pressable>
  );
}

function DemoControls() {
  const { state, setSpeed, setScenario } = useApp();
  const t = useT();
  const speeds: Speed[] = [1, 30, 60];
  const scenarios: { key: ScanScenario; label: Key }[] = [
    { key: 'valid', label: 'scenarioValid' },
    { key: 'outOfRange', label: 'scenarioOutOfRange' },
    { key: 'incomplete', label: 'scenarioIncomplete' },
    { key: 'invalid', label: 'scenarioInvalid' },
  ];
  return (
    <View style={{ borderRadius: radius.lg, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.inkMute, padding: space.lg, gap: space.md }}>
      <Txt variant="label" color={colors.inkSoft}>
        {t('protoControls')}
      </Txt>
      <Txt variant="small" color={colors.inkSoft}>
        {t('protoControlsSub')}
      </Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {speeds.map((s) => (
          <Pill key={s} label={t('speedLabel', { n: s })} selected={state.speed === s} onPress={() => setSpeed(s)} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {scenarios.map((s) => (
          <Pill key={s.key} label={t(s.label)} selected={state.scenario === s.key} onPress={() => setScenario(s.key)} />
        ))}
      </View>
    </View>
  );
}

function ResultsTab() {
  const { state, push } = useApp();
  const t = useT();
  const [filter, setFilter] = useState<OverallStatus | 'all'>('all');
  const list = state.tests.filter((r) => filter === 'all' || classify(r.ntProBnp, r.hFabp) === filter);
  const filters: { key: OverallStatus | 'all'; label: Key }[] = [
    { key: 'all', label: 'filterAll' },
    { key: 'valid', label: 'statusValid' },
    { key: 'incomplete', label: 'statusIncomplete' },
    { key: 'invalid', label: 'statusInvalid' },
  ];
  return (
    <ScrollView contentContainerStyle={{ padding: space.xl, gap: space.lg, paddingBottom: space.xxl }}>
      <Txt variant="h1">{t('resultsHeading')}</Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {filters.map((f) => (
          <Pill key={f.key} label={t(f.label)} selected={filter === f.key} onPress={() => setFilter(f.key)} />
        ))}
      </View>
      <Callout tone="info" icon="clock">
        {t('retentionNote')}
      </Callout>
      {list.length === 0 ? (
        <Txt variant="body" color={colors.inkSoft} style={{ textAlign: 'center', paddingVertical: space.xl }}>
          {t('noMatch')}
        </Txt>
      ) : (
        list.map((r) => <ResultRow key={r.id} record={r} onPress={() => push({ name: 'result', id: r.id })} />)
      )}
    </ScrollView>
  );
}

function AboutTab() {
  const { state, reset, setLang } = useApp();
  const t = useT();
  const markers = Object.keys(MARKERS) as MarkerKey[];
  const languages: { key: Lang; label: string }[] = [
    { key: 'en', label: 'English' },
    { key: 'es', label: 'Español' },
  ];
  return (
    <ScrollView contentContainerStyle={{ padding: space.xl, gap: space.xl, paddingBottom: space.xxl }}>
      <Txt variant="h1">{t('aboutHeading')}</Txt>
      <Card style={{ gap: 12 }}>
        <Txt variant="label" color={colors.inkSoft}>
          {t('languageHeading')}
        </Txt>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {languages.map((l) => (
            <Pill key={l.key} label={l.label} icon="globe" selected={state.lang === l.key} onPress={() => setLang(l.key)} />
          ))}
        </View>
      </Card>
      <Card>
        <Txt variant="label" color={colors.inkSoft} style={{ marginBottom: 6 }}>
          {t('supportHeading')}
        </Txt>
        <Row icon="globe" label={t('webSupport')} />
        <Row icon="mail" label={t('emailSupport')} />
        <Row icon="book-open" label={t('ifu')} />
      </Card>
      <Card>
        <Txt variant="label" color={colors.inkSoft} style={{ marginBottom: 6 }}>
          {t('generalHeading')}
        </Txt>
        <Row icon="lock" label={t('privacy')} />
        <Row icon="file-text" label={t('terms')} />
        <Row icon="shield" label={t('regulatory')} />
        <Row icon="play-circle" label={t('replayTutorial')} onPress={() => reset({ name: 'onboarding' })} />
      </Card>
      <Card style={{ gap: 12 }}>
        <Txt variant="label" color={colors.inkSoft}>
          {t('rangesHeading')}
        </Txt>
        {markers.map((m) => (
          <View key={m} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Txt variant="body">{MARKERS[m].label}</Txt>
            <Txt variant="body" color={colors.inkSoft}>
              {t('rangeTo', { min: MARKERS[m].min, max: MARKERS[m].max, unit: MARKERS[m].unit })}
            </Txt>
          </View>
        ))}
      </Card>
      <Callout tone="warn" title={t('conceptTitle')}>
        {t('conceptBody')}
      </Callout>
    </ScrollView>
  );
}
