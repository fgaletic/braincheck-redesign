import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { Button, Callout, Field, Header, Pill, Screen, Txt } from '../components/ui';
import { LOT_NUMBERS, useApp } from '../state/store';
import { colors, space } from '../theme';
import { useT } from '../useT';

export function NewTestScreen() {
  const { back, begin } = useApp();
  const t = useT();
  const [lot, setLot] = useState<string | null>(null);
  const [patientId, setPatientId] = useState('');
  const [dob, setDob] = useState('');
  const ready = !!lot && patientId.trim().length > 0;

  return (
    <Screen>
      <Header title={t('newTest')} onBack={back} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: space.xl, gap: space.xl }} keyboardShouldPersistTaps="handled">
          <View style={{ gap: 6 }}>
            <Txt variant="h2">{t('lotTitle')}</Txt>
            <Txt variant="small" color={colors.inkSoft}>
              {t('lotHint')}
            </Txt>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {LOT_NUMBERS.map((l) => (
              <Pill key={l} label={l} icon="package" selected={lot === l} onPress={() => setLot(l)} />
            ))}
          </View>

          <Field label={t('patientId')} value={patientId} onChangeText={setPatientId} placeholder={t('patientPlaceholder')} required />
          <Field
            label={t('dob')}
            value={dob}
            onChangeText={setDob}
            placeholder="YYYY-MM-DD"
            hint={t('dobHint')}
            autoCapitalize="none"
          />

          <Callout tone="info" icon="droplet">
            {t('sampleCallout')}
          </Callout>
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={{ padding: space.xl, paddingTop: space.md }}>
        <Button
          label={t('continueToInstructions')}
          icon="arrow-right"
          disabled={!ready}
          onPress={() => lot && begin({ lotNumber: lot, patientId: patientId.trim(), dob: dob.trim() || undefined })}
        />
      </View>
    </Screen>
  );
}
