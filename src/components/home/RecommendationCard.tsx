import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { FeedRecommendation } from '../../stardust-feed';
import { brand, radius, space, type } from '../../design';
import { compactCopy, CONTENT_LIMITS } from '../../stardust-feed';

const TONES = { rose: brand.rose, gold: brand.gold, purple: brand.purple };
export default function RecommendationCard({ item, onPress }: { item: FeedRecommendation; onPress: () => void }) {
  return <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={item.title} style={({ pressed }) => [styles.card, { borderTopColor: TONES[item.tone] }, pressed && styles.pressed]}><View style={[styles.icon, { backgroundColor: `${TONES[item.tone]}22` }]}><View style={[styles.iconCore, { backgroundColor: TONES[item.tone] }]} /></View><Text style={[styles.eyebrow, { color: TONES[item.tone] }]}>{item.eyebrow}</Text><Text style={styles.title}>{compactCopy(item.title, CONTENT_LIMITS.recommendation)}</Text><Text style={styles.detail}>{compactCopy(item.detail, CONTENT_LIMITS.recommendation)}</Text><Text style={[styles.arrow, { color: TONES[item.tone] }]}>→</Text></Pressable>;
}
const styles = StyleSheet.create({ card: { width: 210, minHeight: 190, padding: space.md, borderRadius: radius.lg, backgroundColor: brand.card, borderWidth: 1, borderColor: brand.line, borderTopWidth: 3 }, icon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' }, iconCore: { width: 9, height: 9, borderRadius: 5 }, eyebrow: { ...type.eyebrow, fontSize: 9, lineHeight: 12, marginTop: space.md }, title: { ...type.bodyStrong, color: brand.ink, fontSize: 16, lineHeight: 21, marginTop: space.sm }, detail: { ...type.bodySmall, color: brand.inkMid, fontSize: 12, lineHeight: 17, marginTop: space.xs }, arrow: { marginTop: 'auto', alignSelf: 'flex-end', fontSize: 18 }, pressed: { opacity: 0.74, transform: [{ scale: 0.98 }] } });
