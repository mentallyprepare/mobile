import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { brand, radius, space, type } from '../../design';
import { t } from '../../i18n';
import { useLanguage } from '../../i18n/react';

export default function PersonalMetricsCard({ sealed, streak, night }: { sealed: number; streak: number; night: number }) {
  useLanguage();
  const [expanded, setExpanded] = useState(false);
  const progress = Math.min(100, Math.round((Math.max(0, night) / 21) * 100));

  return (
    <Pressable
      onPress={() => setExpanded((current) => !current)}
      accessibilityRole="button"
      accessibilityLabel={`${t('personal_metrics.a11y_prefix')}${sealed}${t('personal_metrics.a11y_middle')}${streak}${t('personal_metrics.a11y_suffix')}`}
      accessibilityState={{ expanded }}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.topline}><Text style={styles.kicker}>{t('personal_metrics.kicker')}</Text><Text style={styles.action}>{expanded ? t('personal_metrics.action_close') : t('personal_metrics.action_open')}</Text></View>
      <Text style={styles.title}>{t('personal_metrics.title')}</Text>
      <View style={styles.metrics}>
        <Metric value={sealed} label={t('personal_metrics.sealed')} />
        <Metric value={streak} label={t('personal_metrics.streak')} />
        <Metric value={Math.max(0, 21 - night)} label={t('personal_metrics.ahead')} />
      </View>
      {expanded ? (
        <View style={styles.detail} accessibilityLiveRegion="polite">
          <View style={styles.track}><View style={[styles.fill, { width: `${progress}%` }]} /></View>
          <Text style={styles.detailCopy}>{progress}{t('personal_metrics.detail_suffix')}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

function Metric({ value, label }: { value: number; label: string }) {
  return <View style={styles.metric}><Text style={styles.value}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  card: { marginTop: space.lg, padding: space.xl, borderRadius: radius.xl, backgroundColor: brand.card, borderWidth: 1, borderColor: brand.line },
  topline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, kicker: { ...type.eyebrow, color: brand.gold, fontSize: 8 }, action: { ...type.bodySmall, color: brand.rose },
  title: { ...type.bodyStrong, color: brand.ink, fontSize: 19, lineHeight: 24, marginTop: space.sm }, metrics: { flexDirection: 'row', marginTop: space.xl, gap: space.sm }, metric: { flex: 1, minHeight: 82, padding: space.md, borderRadius: radius.md, backgroundColor: brand.surface, justifyContent: 'center' }, value: { ...type.display, color: brand.ink, fontSize: 26 }, metricLabel: { ...type.eyebrow, color: brand.inkLow, fontSize: 8, marginTop: 2 },
  detail: { marginTop: space.lg }, track: { height: 7, overflow: 'hidden', borderRadius: radius.pill, backgroundColor: brand.inkFaint }, fill: { height: '100%', borderRadius: radius.pill, backgroundColor: brand.gold }, detailCopy: { ...type.bodySmall, color: brand.inkMid, marginTop: space.sm }, pressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
});
