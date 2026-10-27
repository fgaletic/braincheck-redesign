import React from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Callout, Card, Header, Screen, StatusChip, Txt, statusColors } from '../components/ui';
import { RangeGauge } from '../components/RangeGauge';
import { MARKERS, MarkerKey, OverallStatus, TestRecord, classify, expiryTimestamp } from '../domain/results';
import { formatClock } from '../domain/timer';
import { formatDate, formatTime, readingText } from '../format';
import { Key } from '../i18n';
import { useApp } from '../state/store';
import { colors, space } from '../theme';
import { useT } from '../useT';

const explanation: Record<OverallStatus, Key> = {
  valid: 'explainValid',
  incomplete: 'explainIncomplete',
  invalid: 'explainInvalid',
};

const referenceNote: Record<MarkerKey, Key> = {
  ntProBnp: 'refNtProBnp',
  hFabp: 'refHFabp',
};

export function ResultScreen({ id }: { id: string }) {
  const { state, back, push, reset } = useApp();
  const t = useT();
  const record = state.tests.find((r) => r.id === id);

  if (!record) {
    return (
      <Screen>
        <Header title={t('resultTitle')} onBack={back} />
        <View style={{ padding: space.xl }}>
          <Txt variant="body">{t('resultGone')}</Txt>
        </View>
      </Screen>
    );
  }

  const status = classify(record.ntProBnp, record.hFabp);
  const sc = statusColors(status);
  const markers = Object.keys(MARKERS) as MarkerKey[];
  const stamp = (ts: number) => `${formatDate(ts, t)}, ${formatTime(ts)}`;

  return (
    <Screen>
      <Header title={t('resultTitle')} onBack={() => reset({ name: 'main' })} />
      <ScrollView contentContainerStyle={{ padding: space.xl, gap: space.lg, paddingBottom: space.xxl }}>
        <View style={{ backgroundColor: sc.bg, borderRadius: 24, padding: space.xl, gap: 10 }}>
          <StatusChip status={status} large />
          <Txt variant="h2">{record.patientId}</Txt>
          <Txt variant="body" color={colors.inkSoft}>
            {record.invalidReason === 'timedOut' ? t('explainTimedOut') : t(explanation[status])}
          </Txt>
        </View>

        {record.timerSkipped ? (
          <Callout tone="warn" title={t('skippedTitle')}>
            {t('skippedBody')}
          </Callout>
        ) : null}

        {markers.map((m) => (
          <MarkerCard key={m} marker={m} record={record} note={t(referenceNote[m])} />
        ))}

        <Card style={{ gap: 12 }}>
          <Txt variant="label" color={colors.inkSoft}>
            {t('testDetails')}
          </Txt>
          <Detail label={t('patientId')} value={record.patientId} />
          {record.dob ? <Detail label={t('dob')} value={record.dob} /> : null}
          <Detail label={t('lotLabel')} value={record.lotNumber} />
          <Detail label={t('dStarted')} value={stamp(record.startedAt)} />
          <Detail label={t('dScanned')} value={stamp(record.scannedAt)} />
          <Detail label={t('dIncubation')} value={record.timerSkipped ? t('capSkipped') : formatClock((record.scannedAt - record.startedAt) / 1000)} />
          <Detail label={t('dAutoDeletes')} value={formatDate(expiryTimestamp(record), t)} />
        </Card>

        <Callout tone="info" icon="info">
          {t('noDecision')}
        </Callout>

        <Button label={t('startAnother')} icon="plus" variant="secondary" onPress={() => push({ name: 'newTest' })} />
      </ScrollView>
    </Screen>
  );
}

function MarkerCard({ marker, record, note }: { marker: MarkerKey; record: TestRecord; note: string }) {
  const t = useT();
  const spec = MARKERS[marker];
  const reading = record[marker];
  return (
    <Card style={{ gap: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Txt variant="title">{spec.label}</Txt>
        <StatusChip status={reading.valid ? 'valid' : 'invalid'} />
      </View>
      <Txt
        variant="h1"
        style={reading.valid ? { fontSize: 34, lineHeight: 40 } : { fontSize: 24, lineHeight: 30 }}
        color={reading.valid ? colors.ink : colors.inkMute}
      >
        {readingText(marker, reading, t)}
      </Txt>
      <RangeGauge marker={marker} reading={reading} />
      <Txt variant="caption" color={colors.inkMute}>
        {note}
      </Txt>
    </Card>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
      <Txt variant="small" color={colors.inkSoft}>
        {label}
      </Txt>
      <Txt variant="small" style={{ fontWeight: '600', textAlign: 'right', flexShrink: 1 }}>
        {value}
      </Txt>
    </View>
  );
}
