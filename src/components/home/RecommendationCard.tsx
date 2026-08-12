import { Pressable, StyleSheet, Text } from 'react-native';
import type { FeedRecommendation } from '../../stardust-feed';
import { brand, radius, space, type } from '../../design';

const TONES = { rose: brand.rose, gold: brand.gold, purple: brand.purple };
export default function RecommendationCard({ item, onPress }: { item: FeedRecommendation; onPress: () => void }) {
  return <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={item.title} style={({ pressed }) => [styles.card, { borderTopColor: TONES[item.tone] }, pressed && styles.pressed]}><Text style={[styles.eyebrow, { color: TONES[item.tone] }]}>{item.eyebrow}</Text><Text style={styles.title}>{item.title}</Text><Text style={styles.detail}>{item.detail}</Text><Text style={[styles.arrow, { color: TONES[item.tone] }]}>→</Text></Pressable>;
}
const styles = StyleSheet.create({ card: { width: 238, minHeight: 182, padding: space.lg, borderRadius: radius.lg, backgroundColor: brand.card, borderWidth: 1, borderColor: brand.line, borderTopWidth: 3 }, eyebrow: { ...type.eyebrow, fontSize: 8 }, title: { ...type.bodyStrong, color: brand.ink, fontSize: 17, lineHeight: 23, marginTop: space.md }, detail: { ...type.bodySmall, color: brand.inkMid, marginTop: space.sm }, arrow: { marginTop: 'auto', alignSelf: 'flex-end', fontSize: 20 }, pressed: { opacity: 0.74, transform: [{ scale: 0.98 }] } });
