import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { TimerPhase, formatClock } from '../domain/timer';
import { colors } from '../theme';

const phaseColor: Record<TimerPhase, string> = {
  incubating: colors.ink,
  warning: colors.brand,
  scanReady: colors.go,
  expired: colors.inkMute,
};

export function TimerRing({
  phase,
  progress,
  seconds,
  caption,
  size = 264,
}: {
  phase: TimerPhase;
  /** Elapsed share of the current phase, 0..1. The ring drains as it grows. */
  progress: number;
  seconds: number;
  caption: string;
  size?: number;
}) {
  const stroke = 18;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = phaseColor[phase];
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.track} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={c * Math.min(1, Math.max(0, progress))}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text
        accessibilityRole="timer"
        style={{ fontSize: 60, fontWeight: '800', color, fontVariant: ['tabular-nums'], letterSpacing: -1 }}
      >
        {formatClock(seconds)}
      </Text>
      <Text style={{ fontSize: 14, fontWeight: '600', color: colors.inkSoft, marginTop: 2 }}>{caption}</Text>
    </View>
  );
}
