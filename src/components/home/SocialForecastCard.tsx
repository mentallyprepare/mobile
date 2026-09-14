import { Pressable, StyleSheet, Text, View } from 'react-native';
import { brand, radius, space, type } from '../../design';
import { compactCopy, CONTENT_LIMITS } from '../../stardust-feed';
import { t } from '../../i18n';
import { useLanguage } from '../../i18n/react';

export default function SocialForecastCard({ hasMatch, partnerPresent, onPrimary, onSecondary }: { hasMatch: boolean; partnerPresent: boolean; onPrimary: () => void; onSecondary: () => void }) {
  useLanguage();
  const title = hasMatch
    ? (partnerPresent ? t('social_forecast.title_present') : t('social_forecast.title_quiet'))
    : t('social_forecast.title_no_match');
  const body = hasMatch ? t('social_forecast.body_matched') : t('social_forecast.body_no_match');
  const primaryLabel = hasMatch ? t('social_forecast.primary_open') : t('social_forecast.primary_setup');
  const secondaryLabel = hasMatch ? t('social_forecast.secondary_safety') : t('social_forecast.secondary_how');
  return (
    <View style={styles.card}>
      <View style={styles.orb}><View style={[styles.dot, partnerPresent && styles.dotActive]} /></View>
      <Text style={styles.kicker}>{hasMatch ? t('social_forecast.kicker_shared') : t('social_forecast.kicker_connection')}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{compactCopy(body, CONTENT_LIMITS.socialMessage)}</Text>
      <View style={styles.actions}>
        <Pressable onPress={onPrimary} accessibilityRole="button" accessibilityLabel={primaryLabel} style={({ pressed }) => [styles.primary, pressed && styles.pressed]}><Text style={styles.primaryText}>{primaryLabel}</Text></Pressable>
        <Pressable onPress={onSecondary} accessibilityRole="button" accessibilityLabel={secondaryLabel} style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}><Text style={styles.secondaryText}>{secondaryLabel}</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: space.lg, padding: space.lg, borderRadius: radius.xl, backgroundColor: brand.card, borderWidth: 1, borderColor: brand.line },
  orb: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(137,108,181,0.16)', alignItems: 'center', justifyContent: 'center' },
  dot: { width: 11, height: 11, borderRadius: 6, backgroundColor: brand.inkFaint }, dotActive: { backgroundColor: brand.rose },
  kicker: { ...type.eyebrow, color: brand.purple, fontSize: 9, lineHeight: 12, marginTop: space.lg },
  title: { ...type.bodyStrong, color: brand.ink, fontSize: 19, lineHeight: 24, marginTop: space.xs },
  body: { ...type.body, color: brand.inkMid, fontSize: 14, lineHeight: 20, marginTop: space.sm },
  actions: { flexDirection: 'row', gap: space.sm, marginTop: space.lg },
  primary: { flex: 1, minHeight: 46, borderRadius: radius.pill, backgroundColor: brand.purple, alignItems: 'center', justifyContent: 'center' }, primaryText: { ...type.bodyStrong, color: brand.ink, fontSize: 12 },
  secondary: { flex: 1, minHeight: 46, borderRadius: radius.pill, borderWidth: 1, borderColor: brand.line, alignItems: 'center', justifyContent: 'center' }, secondaryText: { ...type.bodyStrong, color: brand.inkMid, fontSize: 12 }, pressed: { opacity: 0.72 },
});
