import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { brand, space, type } from '../../design';

export default function DailyFeedSection({ eyebrow, title, actionLabel, onAction, children }: { eyebrow: string; title: string; actionLabel?: string; onAction?: () => void; children: ReactNode }) {
  return <View style={styles.section}><View style={styles.header}><View style={styles.copy}><Text style={styles.eyebrow}>{eyebrow}</Text><Text style={styles.title}>{title}</Text></View>{actionLabel && onAction ? <Pressable onPress={onAction} accessibilityRole="button" accessibilityLabel={actionLabel} style={({ pressed }) => pressed && styles.pressed}><Text style={styles.action}>{actionLabel}</Text></Pressable> : null}</View>{children}</View>;
}
const styles = StyleSheet.create({ section: { marginTop: space.xxl }, header: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }, copy: { flex: 1, paddingRight: space.md }, eyebrow: { ...type.eyebrow, color: brand.rose, fontSize: 8, letterSpacing: 1.2 }, title: { ...type.displayItalic, color: brand.ink, fontSize: 28, lineHeight: 34, marginTop: 3 }, action: { ...type.bodyStrong, color: brand.gold, fontSize: 12 }, pressed: { opacity: 0.65 } });
