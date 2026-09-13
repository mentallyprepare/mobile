import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import CosmicScreen from '../../src/components/app/CosmicScreen';
import CommunityCard from '../../src/components/home/CommunityCard';
import { LoadFailure, LoadPlaceholder, StaleNotice } from '../../src/components/app/LoadFailure';
import { useMeShared } from '../../src/api/me-provider';
import { describeLoad } from '../../src/api/load-state';
import { brand, radius, space, type } from '../../src/design';
import { t } from '../../src/i18n';
import { useLanguage } from '../../src/i18n/react';

export default function Community() {
  const router = useRouter();
  useLanguage(); // re-render when the language changes
  const { data, loading, error, hasLoaded, reload } = useMeShared();
  const view = describeLoad({ loading, error, hasLoaded });

  if (view === 'first-load') return <CosmicScreen><LoadPlaceholder label={t('discover.loading')} /></CosmicScreen>;
  if (view === 'failed') return <CosmicScreen><LoadFailure error={error} onRetry={() => void reload()} busy={loading} /></CosmicScreen>;

  const hasMatch = !!data?.match;
  const partnerPresent = data?.partnerStatus?.partnerHasWrittenToday ?? false;
  return (
    <CosmicScreen refreshing={loading} onRefresh={() => void reload()}>
      <Text style={styles.kicker}>{t('discover.kicker')}</Text>
      <Text style={styles.title}>{t('discover.title')}</Text>
      <Text style={styles.body}>{t('discover.body')}</Text>
      {view === 'stale' ? <StaleNotice error={error} onRetry={() => void reload()} busy={loading} /> : null}
      <CommunityCard hasMatch={hasMatch} partnerPresent={partnerPresent} onPress={() => router.push(hasMatch ? '/rooms' : '/scan')} />

      {!hasMatch ? (
        <Pressable
          onPress={() => router.push('/tonights' as Href)}
          accessibilityRole="button"
          accessibilityLabel={t('discover.tonights_a11y')}
          accessibilityHint={t('discover.tonights_hint')}
          style={({ pressed }) => [styles.tonights, pressed && styles.pressed]}
        >
          <Text style={styles.tonightsKicker}>{t('discover.tonights_kicker')}</Text>
          <Text style={styles.tonightsTitle}>{t('discover.tonights_title')}</Text>
          <Text style={styles.tonightsBody}>{t('discover.tonights_body')}</Text>
          <Text style={styles.tonightsArrow}>{t('discover.open')}</Text>
        </Pressable>
      ) : null}

      <Pressable
        onPress={() => router.push('/silent' as Href)}
        accessibilityRole="button"
        accessibilityLabel={t('discover.silent_a11y')}
        accessibilityHint={t('discover.silent_hint')}
        style={({ pressed }) => [styles.silent, pressed && styles.pressed]}
      >
        <Text style={styles.silentKicker}>{t('discover.silent_kicker')}</Text>
        <Text style={styles.silentTitle}>{t('discover.silent_title')}</Text>
        <Text style={styles.silentBody}>{t('discover.silent_body')}</Text>
        <Text style={styles.silentArrow}>{t('discover.open')}</Text>
      </Pressable>

      <View style={styles.boundary}><Text style={styles.boundaryTitle}>{t('discover.boundary_title')}</Text><Text style={styles.boundaryBody}>{t('discover.boundary_body')}</Text></View>
      <Pressable onPress={() => router.push('/safety-privacy' as Href)} accessibilityRole="button" accessibilityLabel={t('discover.safety_a11y')} style={({ pressed }) => [styles.action, pressed && styles.pressed]}><Text style={styles.actionText}>{t('discover.safety')}</Text></Pressable>
    </CosmicScreen>
  );
}

const styles = StyleSheet.create({
  kicker: { ...type.eyebrow, color: brand.rose, fontSize: 9 }, title: { ...type.displayItalic, color: brand.ink, fontSize: 36, lineHeight: 42, marginTop: space.sm }, body: { ...type.body, color: brand.inkMid, marginTop: space.sm, maxWidth: 390 },
  boundary: { marginTop: space.xl, padding: space.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: brand.line, backgroundColor: brand.card }, boundaryTitle: { ...type.bodyStrong, color: brand.ink }, boundaryBody: { ...type.bodySmall, color: brand.inkMid, marginTop: space.xs },
  silent: { marginTop: space.lg, padding: space.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: brand.line, backgroundColor: brand.card },
  silentKicker: { ...type.eyebrow, color: brand.rose, fontSize: 10, letterSpacing: 1.6 },
  silentTitle: { ...type.displayItalic, color: brand.ink, fontSize: 22, lineHeight: 28, marginTop: space.xs },
  silentBody: { ...type.bodySmall, color: brand.inkMid, marginTop: space.sm, lineHeight: 19 },
  silentArrow: { ...type.bodyStrong, color: brand.rose, marginTop: space.md, fontSize: 14 },
  tonights: { marginTop: space.lg, padding: space.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: brand.line, backgroundColor: brand.card },
  tonightsKicker: { ...type.eyebrow, color: brand.gold, fontSize: 10, letterSpacing: 1.6 },
  tonightsTitle: { ...type.displayItalic, color: brand.ink, fontSize: 22, lineHeight: 28, marginTop: space.xs },
  tonightsBody: { ...type.bodySmall, color: brand.inkMid, marginTop: space.sm, lineHeight: 19 },
  tonightsArrow: { ...type.bodyStrong, color: brand.gold, marginTop: space.md, fontSize: 14 },
  action: { minHeight: 50, marginTop: space.lg, borderRadius: radius.pill, borderWidth: 1, borderColor: brand.line, alignItems: 'center', justifyContent: 'center' }, actionText: { ...type.bodyStrong, color: brand.rose }, pressed: { opacity: 0.72 },
});
