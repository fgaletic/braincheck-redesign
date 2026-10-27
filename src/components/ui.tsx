import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, TextInput, TextStyle, View, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OverallStatus } from '../domain/results';
import { colors, radius, shadow, space } from '../theme';
import { Key } from '../i18n';
import { useT } from '../useT';
import { BrainMark } from './Illustrations';

export type IconName = React.ComponentProps<typeof Feather>['name'];

type Variant = 'h1' | 'h2' | 'title' | 'body' | 'small' | 'caption' | 'label';

const typeScale: Record<Variant, TextStyle> = {
  h1: { fontSize: 30, lineHeight: 36, fontWeight: '800', letterSpacing: -0.5 },
  h2: { fontSize: 22, lineHeight: 28, fontWeight: '700', letterSpacing: -0.2 },
  title: { fontSize: 17, lineHeight: 24, fontWeight: '700' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  small: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
};

export function Txt({
  variant = 'body',
  color = colors.ink,
  style,
  children,
  ...rest
}: {
  variant?: Variant;
  color?: string;
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
} & React.ComponentProps<typeof Text>) {
  return (
    <Text {...rest} style={[typeScale[variant], { color }, style]}>
      {children}
    </Text>
  );
}

export function Screen({ children, background = colors.bg }: { children: React.ReactNode; background?: string }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: background }} edges={['top', 'bottom']}>
      {children}
    </SafeAreaView>
  );
}

export function Header({
  title,
  onBack,
  right,
  dark,
}: {
  title?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  dark?: boolean;
}) {
  const fg = dark ? '#FFFFFF' : colors.ink;
  const t = useT();
  return (
    <View style={styles.header}>
      <View style={styles.headerSide}>
        {onBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('back')}
            onPress={onBack}
            style={({ pressed }) => [styles.iconBtn, dark && { backgroundColor: 'rgba(255,255,255,0.12)' }, pressed && { opacity: 0.7 }]}
          >
            <Feather name="chevron-left" size={26} color={fg} />
          </Pressable>
        ) : (
          <BrainMark size={30} color={colors.brand} />
        )}
      </View>
      <Txt variant="title" color={fg} style={{ flex: 1, textAlign: 'center' }} numberOfLines={1}>
        {title ?? ''}
      </Txt>
      <View style={[styles.headerSide, { alignItems: 'flex-end' }]}>{right}</View>
    </View>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'onDark';

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  style,
}: {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const palette: Record<ButtonVariant, { bg: string; fg: string; border?: string }> = {
    primary: { bg: colors.brand, fg: '#FFFFFF' },
    success: { bg: colors.go, fg: '#FFFFFF' },
    danger: { bg: colors.invalid, fg: '#FFFFFF' },
    secondary: { bg: colors.surface, fg: colors.ink, border: colors.line },
    ghost: { bg: 'transparent', fg: colors.inkSoft },
    onDark: { bg: 'rgba(255,255,255,0.14)', fg: '#FFFFFF' },
  };
  const p = palette[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: p.bg, borderColor: p.border ?? 'transparent', opacity: disabled ? 0.4 : pressed ? 0.88 : 1 },
        variant === 'primary' || variant === 'success' ? shadow.card : null,
        style,
      ]}
    >
      {icon ? <Feather name={icon} size={20} color={p.fg} style={{ marginRight: 10 }} /> : null}
      <Text style={{ color: p.fg, fontSize: 17, fontWeight: '700', textAlign: 'center', flexShrink: 1 }}>{label}</Text>
    </Pressable>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const statusConfig: Record<OverallStatus, { label: Key; icon: IconName; fg: string; bg: string }> = {
  valid: { label: 'statusValid', icon: 'check-circle', fg: colors.valid, bg: colors.validTint },
  incomplete: { label: 'statusIncomplete', icon: 'alert-triangle', fg: colors.incomplete, bg: colors.incompleteTint },
  invalid: { label: 'statusInvalid', icon: 'x-circle', fg: colors.invalid, bg: colors.invalidTint },
};

export function statusColors(status: OverallStatus) {
  return statusConfig[status];
}

/** Status is always icon + text, never colour alone. */
export function StatusChip({ status, large }: { status: OverallStatus; large?: boolean }) {
  const c = statusConfig[status];
  const t = useT();
  return (
    <View style={[styles.chip, { backgroundColor: c.bg }, large && { paddingVertical: 8, paddingHorizontal: 14 }]}>
      <Feather name={c.icon} size={large ? 20 : 15} color={c.fg} />
      <Text style={{ color: c.fg, fontWeight: '700', fontSize: large ? 17 : 13, marginLeft: 6 }}>{t(c.label)}</Text>
    </View>
  );
}

export function Pill({
  label,
  selected,
  onPress,
  icon,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        selected ? { backgroundColor: colors.ink, borderColor: colors.ink } : { backgroundColor: colors.surface, borderColor: colors.line },
        pressed && { opacity: 0.85 },
      ]}
    >
      {icon ? <Feather name={icon} size={15} color={selected ? '#FFFFFF' : colors.inkSoft} style={{ marginRight: 6 }} /> : null}
      <Text style={{ color: selected ? '#FFFFFF' : colors.ink, fontWeight: '600', fontSize: 14 }}>{label}</Text>
    </Pressable>
  );
}

export function Dots({ count, index }: { count: number; index: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center' }}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={{
            height: 8,
            width: i === index ? 26 : 8,
            borderRadius: 4,
            backgroundColor: i === index ? colors.brand : colors.line,
          }}
        />
      ))}
    </View>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  hint,
  required,
  autoCapitalize = 'characters',
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  autoCapitalize?: 'none' | 'characters';
}) {
  const t = useT();
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Txt variant="label" color={colors.inkSoft}>
          {label}
        </Txt>
        <Txt variant="caption" color={required ? colors.brand : colors.inkMute} style={{ marginLeft: 8 }}>
          {required ? t('required') : t('optional')}
        </Txt>
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inkMute}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        accessibilityLabel={label}
        style={styles.input}
      />
      {hint ? (
        <Txt variant="caption" color={colors.inkMute}>
          {hint}
        </Txt>
      ) : null}
    </View>
  );
}

type Tone = 'info' | 'warn' | 'danger' | 'good';

const toneConfig: Record<Tone, { fg: string; bg: string; icon: IconName }> = {
  info: { fg: colors.info, bg: colors.infoTint, icon: 'info' },
  warn: { fg: colors.incomplete, bg: colors.incompleteTint, icon: 'alert-triangle' },
  danger: { fg: colors.invalid, bg: colors.invalidTint, icon: 'alert-octagon' },
  good: { fg: colors.valid, bg: colors.validTint, icon: 'check-circle' },
};

export function Callout({
  tone = 'info',
  title,
  children,
  icon,
}: {
  tone?: Tone;
  title?: string;
  children?: React.ReactNode;
  icon?: IconName;
}) {
  const c = toneConfig[tone];
  return (
    <View style={[styles.callout, { backgroundColor: c.bg }]}>
      <Feather name={icon ?? c.icon} size={22} color={c.fg} style={{ marginTop: 1 }} />
      <View style={{ flex: 1, gap: 2 }}>
        {title ? (
          <Txt variant="title" color={c.fg} style={{ fontSize: 16 }}>
            {title}
          </Txt>
        ) : null}
        {children ? (
          <Txt variant="small" color={colors.ink}>
            {children}
          </Txt>
        ) : null}
      </View>
    </View>
  );
}

export function Row({
  icon,
  label,
  value,
  onPress,
}: {
  icon?: IconName;
  label: string;
  value?: string;
  onPress?: () => void;
}) {
  const content = (
    <View style={styles.row}>
      {icon ? <Feather name={icon} size={20} color={colors.inkSoft} style={{ marginRight: 14 }} /> : null}
      <Txt variant="body" style={{ flex: 1 }}>
        {label}
      </Txt>
      {value ? (
        <Txt variant="small" color={colors.inkSoft}>
          {value}
        </Txt>
      ) : null}
      {onPress ? <Feather name="chevron-right" size={20} color={colors.inkMute} style={{ marginLeft: 6 }} /> : null}
    </View>
  );
  return onPress ? (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => pressed && { opacity: 0.7 }}>
      {content}
    </Pressable>
  ) : (
    content
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.lg, paddingVertical: space.sm, minHeight: 56 },
  headerSide: { minWidth: 56, justifyContent: 'center' },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btn: {
    minHeight: 58,
    borderRadius: radius.md,
    paddingHorizontal: space.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.lg, ...shadow.card },
  chip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5, paddingHorizontal: 10, borderRadius: radius.pill, alignSelf: 'flex-start' },
  pill: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, borderRadius: radius.pill, borderWidth: 1.5 },
  input: {
    minHeight: 56,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    paddingHorizontal: space.lg,
    fontSize: 18,
    fontWeight: '600',
    color: colors.ink,
  },
  callout: { flexDirection: 'row', gap: 12, padding: space.lg, borderRadius: radius.md },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 56, paddingVertical: 6 },
});
