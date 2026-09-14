import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { brand, radius, space, type } from '../../design';
import { compactCopy, CONTENT_LIMITS } from '../../stardust-feed';
import { t } from '../../i18n';
import { useLanguage } from '../../i18n/react';

export default function InsightCard({ text, active, onPress }: { text: string; active: boolean; onPress?: () => void }) {
  useLanguage();
  const [expanded, setExpanded] = useState(false);
  const compact = compactCopy(text, CONTENT_LIMITS.insight);
  const canExpand = compact !== text.replace(/\s+/g, ' ').trim();
  const a11y = canExpand
    ? (expanded ? t('insight_card.a11y_show_less') : t('insight_card.a11y_read_more'))
    : onPress ? t('insight_card.a11y_open') : undefined;
  return (
    <Pressable onPress={() => canExpand ? setExpanded((value) => !value) : onPress?.()} disabled={!canExpand && !onPress} accessibilityRole={canExpand || onPress ? 'button' : undefined} accessibilityLabel={a11y} accessibilityState={canExpand ? { expanded } : undefined} style={({ pressed }) => [styles.card, active && styles.active, pressed && styles.pressed]}>
      <Text style={styles.eyebrow}>{active ? t('insight_card.eyebrow_active') : t('insight_card.eyebrow_idle')}</Text>
      <Text style={styles.text}>{expanded ? text : compact}</Text>
      <Text style={styles.note}>{t('insight_card.note')}</Text>
      {canExpand ? <Text style={styles.action}>{expanded ? t('insight_card.action_show_less') : t('insight_card.action_read_more')}</Text> : onPress ? <Text style={styles.action}>{t('insight_card.action_open')}</Text> : null}
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
