import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { brand, radius, space, type } from '../../design';
import { compactCopy, CONTENT_LIMITS } from '../../stardust-feed';

export default function InsightCard({ text, active, onPress }: { text: string; active: boolean; onPress?: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const compact = compactCopy(text, CONTENT_LIMITS.insight);
  const canExpand = compact !== text.replace(/\s+/g, ' ').trim();
  return (
    <Pressable onPress={() => canExpand ? setExpanded((value) => !value) : onPress?.()} disabled={!canExpand && !onPress} accessibilityRole={canExpand || onPress ? 'button' : undefined} accessibilityLabel={canExpand ? `${expanded ? 'Collapse' : 'Read more of'} this reflection` : onPress ? 'Open this reflection' : undefined} accessibilityState={canExpand ? { expanded } : undefined} style={({ pressed }) => [styles.card, active && styles.active, pressed && styles.pressed]}>
      <Text style={styles.eyebrow}>{active ? 'A SMALL REFLECTION' : 'CHECK IN QUIETLY'}</Text>
      <Text style={styles.text}>{expanded ? text : compact}</Text>
      <Text style={styles.note}>private on this device · not used for matching</Text>
      {canExpand ? <Text style={styles.action}>{expanded ? 'Show less' : 'Read more'} →</Text> : onPress ? <Text style={styles.action}>Open reflection →</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: space.lg,
    padding: space.lg,
    borderRadius: radius.lg,
    backgroundColor: brand.card,
    borderWidth: 1,
    borderColor: brand.line,
  },
  active: { borderColor: 'rgba(235,180,194,0.42)' },
  eyebrow: { ...type.eyebrow, fontSize: 8, color: brand.rose },
  text: { ...type.body, fontSize: 14, lineHeight: 20, color: brand.ink, marginTop: space.sm },
  note: { ...type.bodySmall, color: brand.inkLow, marginTop: space.md },
  action: { ...type.bodyStrong, color: brand.rose, marginTop: space.md },
  pressed: { opacity: 0.76, transform: [{ scale: 0.99 }] },
});
