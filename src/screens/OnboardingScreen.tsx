import React, { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Button, Dots, Header, Screen, StatusChip, Txt } from '../components/ui';
import { Cassette, NetworkHero } from '../components/Illustrations';
import { Key } from '../i18n';
import { colors, space } from '../theme';
import { useApp } from '../state/store';
import { useT } from '../useT';

const SLIDE_COUNT = 4;

const TOUR: { icon: React.ComponentProps<typeof Feather>['name']; text: Key }[] = [
  { icon: 'clipboard', text: 'tourStep1' },
  { icon: 'droplet', text: 'tourStep2' },
  { icon: 'clock', text: 'tourStep3' },
  { icon: 'camera', text: 'tourStep4' },
];

const HELP: { icon: React.ComponentProps<typeof Feather>['name']; text: Key }[] = [
  { icon: 'life-buoy', text: 'helpSupport' },
  { icon: 'book-open', text: 'helpInstructions' },
  { icon: 'shield', text: 'helpRegulatory' },
  { icon: 'lock', text: 'helpPrivacy' },
  { icon: 'play-circle', text: 'helpReplay' },
];

export function OnboardingScreen() {
  const { reset } = useApp();
  const t = useT();
  const [index, setIndex] = useState(0);
  const [dontShow, setDontShow] = useState(true);
  const last = index === SLIDE_COUNT - 1;
  const finish = () => reset({ name: 'main' });

  return (
    <Screen background={colors.surface}>
      <Header
        right={
          !last ? (
            <Pressable accessibilityRole="button" accessibilityLabel={t('skipTutorialA11y')} onPress={finish} hitSlop={12}>
              <Txt variant="title" color={colors.inkSoft} style={{ fontSize: 16 }}>
                {t('skip')}
              </Txt>
            </Pressable>
          ) : null
        }
      />
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: space.xl, gap: space.xl }}>
        {index === 0 ? (
          <View style={{ alignItems: 'center', gap: space.xl, paddingTop: space.lg }}>
            <NetworkHero />
            <View style={{ gap: 10, alignItems: 'center' }}>
              <Txt variant="label" color={colors.brand}>
                {t('conceptRedesign')}
              </Txt>
              <Txt variant="h1" style={{ textAlign: 'center' }}>
                BRAINCheck
              </Txt>
              <Txt variant="body" color={colors.inkSoft} style={{ textAlign: 'center', maxWidth: 320 }}>
                {t('welcomeBody')}
              </Txt>
            </View>
          </View>
        ) : null}

        {index === 1 ? (
          <View style={{ gap: space.xl }}>
            <View style={{ alignItems: 'center' }}>
              <Cassette target="left" liquid="blood" count={2} width={260} />
            </View>
            <View style={{ gap: 8 }}>
              <Txt variant="h2">{t('runTestTitle')}</Txt>
              <Txt variant="body" color={colors.inkSoft}>
                {t('runTestSub')}
              </Txt>
            </View>
            {TOUR.map((item, i) => (
              <View key={item.text} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.brandTint, alignItems: 'center', justifyContent: 'center' }}>
                  <Feather name={item.icon} size={20} color={colors.brand} />
                </View>
                <Txt variant="body" style={{ flex: 1 }}>{`${i + 1}. ${t(item.text)}`}</Txt>
              </View>
            ))}
          </View>
        ) : null}

        {index === 2 ? (
          <View style={{ gap: space.xl }}>
            <View style={{ gap: 8 }}>
              <Txt variant="h2">{t('statesTitle')}</Txt>
              <Txt variant="body" color={colors.inkSoft}>
                {t('statesSub')}
              </Txt>
            </View>
            {(
              [
                ['valid', 'validDef'],
                ['incomplete', 'incompleteDef'],
                ['invalid', 'invalidDef'],
              ] as const
            ).map(([status, def]) => (
              <View key={status} style={{ gap: 8, padding: space.lg, borderRadius: 16, backgroundColor: colors.bg }}>
                <StatusChip status={status} large />
                <Txt variant="body" color={colors.inkSoft}>
                  {t(def)}
                </Txt>
              </View>
            ))}
          </View>
        ) : null}

        {index === 3 ? (
          <View style={{ gap: space.xl }}>
            <View style={{ gap: 8 }}>
              <Txt variant="h2">{t('helpTitle')}</Txt>
              <Txt variant="body" color={colors.inkSoft}>
                {t('helpSub')}
              </Txt>
            </View>
            {HELP.map((item) => (
              <View key={item.text} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <Feather name={item.icon} size={22} color={colors.inkSoft} />
                <Txt variant="body">{t(item.text)}</Txt>
              </View>
            ))}
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: dontShow }}
              onPress={() => setDontShow((v) => !v)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48 }}
            >
              <View
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 8,
                  borderWidth: 2,
                  borderColor: dontShow ? colors.brand : colors.inkMute,
                  backgroundColor: dontShow ? colors.brand : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {dontShow ? <Feather name="check" size={18} color="#FFFFFF" /> : null}
              </View>
              <Txt variant="body">{t('dontShowAgain')}</Txt>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>

      <View style={{ padding: space.xl, gap: space.lg }}>
        <Dots count={SLIDE_COUNT} index={index} />
        <Button label={last ? t('getStarted') : t('next')} onPress={() => (last ? finish() : setIndex(index + 1))} />
      </View>
    </Screen>
  );
}
