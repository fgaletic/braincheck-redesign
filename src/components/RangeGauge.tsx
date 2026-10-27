import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { MARKERS, MarkerKey, MarkerReading, rangeFraction, rangePosition } from '../domain/results';
import { colors } from '../theme';
import { useT } from '../useT';
import { Txt } from './ui';

/** Shows where a reading sits inside the assay's measuring range. No clinical interpretation. */
export function RangeGauge({ marker, reading }: { marker: MarkerKey; reading: MarkerReading }) {
  const spec = MARKERS[marker];
  const t = useT();
  const valid = reading.valid;
  const position = reading.valid ? rangePosition(marker, reading.value) : 'within';
  const fraction = reading.valid ? rangeFraction(marker, reading.value) : 0;
  const outside = position !== 'within';
  const thumb = outside ? colors.incomplete : colors.ink;

  return (
    <View style={{ gap: 8 }}>
      <View style={{ height: 28, justifyContent: 'center' }}>
        <View style={{ height: 10, borderRadius: 5, backgroundColor: valid ? colors.track : '#F1F5F9', overflow: 'hidden' }}>
          {valid ? <View style={{ width: `${fraction * 100}%`, height: 10, backgroundColor: outside ? '#F2C77B' : '#94A3B8' }} /> : null}
        </View>
        {valid ? (
          <View
            style={{
              position: 'absolute',
              left: `${fraction * 100}%`,
              marginLeft: -11,
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: colors.surface,
              borderWidth: 4,
              borderColor: thumb,
            }}
          />
        ) : null}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Txt variant="caption" color={colors.inkSoft}>{`${spec.min} ${spec.unit}`}</Txt>
        <Txt variant="caption" color={colors.inkMute}>
          {t('measuringRange')}
        </Txt>
        <Txt variant="caption" color={colors.inkSoft}>{`${spec.max} ${spec.unit}`}</Txt>
      </View>
      {outside ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Feather name={position === 'below' ? 'arrow-down-left' : 'arrow-up-right'} size={16} color={colors.incomplete} />
          <Txt variant="small" color={colors.incomplete} style={{ fontWeight: '600' }}>
            {position === 'below' ? t('belowRange') : t('aboveRange')}
          </Txt>
        </View>
      ) : null}
    </View>
  );
}
