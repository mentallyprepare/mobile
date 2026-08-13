import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { brand, radius, space, type } from '../../design';

export default function PersonalMetricsCard({ sealed, streak, night }: { sealed: number; streak: number; night: number }) {
  const [expanded, setExpanded] = useState(false);
  const progress = Math.min(100, Math.round((Math.max(0, night) / 21) * 100));

  return (
    <Pressable
      onPress={() => setExpanded((current) => !current)}
      accessibilityRole="button"
      accessibilityLabel={`Personal ritual metrics. ${sealed} nights sealed, ${streak} night streak.`}
      accessibilityState={{ expanded }}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.topline}><Text style={styles.kicker}>YOUR RHYTHM</Text><Text style={styles.action}>{expanded ? 'Close' : 'Details'}</Text></View>
      <Text style={styles.title}>Presence, without surveillance.</Text>
      <View style={styles.metrics}>
        <Metric value={sealed} label="SEALED" />
        <Metric value={streak} label="STREAK" />
        <Metric value={Math.max(0, 21 - night)} label="AHEAD" />
      </View>
      {expanded ? (
        <View style={styles.detail} accessibilityLiveRegion="polite">
          <View style={styles.track}><View style={[styles.fill, { width: `${progress}%` }]} /></View>
          <Text style={styles.detailCopy}>{progress}% through the 21-night arc. Only completion and timing appear here—never note text, sleep claims, or inferred mood.</Text>
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
