import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TagGrid from './TagGrid';
import type { FeedTag } from '../../stardust-feed';
import { brand, radius, space, type } from '../../design';
import { t } from '../../i18n';
import { useLanguage } from '../../i18n/react';

export default function AddMoreSheet({ visible, tags, selected, onToggle, onClose }: { visible: boolean; tags: FeedTag[]; selected: string[]; onToggle: (id: string) => void; onClose: () => void }) {
  useLanguage();
  const insets = useSafeAreaInsets();
  return <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}><View style={styles.root}><Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" accessibilityLabel={t('add_more.dismiss_a11y')} /><View accessibilityViewIsModal style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, space.lg) }]}><View style={styles.handle} /><Text style={styles.kicker}>{t('add_more.kicker')}</Text><Text style={styles.title}>{t('add_more.title')}</Text><Text style={styles.body}>{t('add_more.body')}</Text><TagGrid tags={tags} selected={selected} onToggle={onToggle} onAddMore={onClose} showAddMore={false} /><Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={t('add_more.done_a11y')} style={({ pressed }) => [styles.done, pressed && styles.pressed]}><Text style={styles.doneText}>{t('add_more.done')}</Text></Pressable></View></View></Modal>;
}
const styles = StyleSheet.create({ root: { flex: 1, justifyContent: 'flex-end' }, backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(8,5,15,0.74)' }, sheet: { padding: space.lg, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, backgroundColor: brand.card, borderWidth: 1, borderColor: brand.line }, handle: { width: 38, height: 4, borderRadius: 2, alignSelf: 'center', backgroundColor: brand.inkFaint }, kicker: { ...type.eyebrow, color: brand.rose, fontSize: 8, marginTop: space.lg }, title: { ...type.displayItalic, color: brand.ink, fontSize: 30, lineHeight: 36, marginTop: 3 }, body: { ...type.bodySmall, color: brand.inkMid, marginTop: space.sm }, done: { minHeight: 50, marginTop: space.xl, borderRadius: radius.pill, backgroundColor: brand.rose, alignItems: 'center', justifyContent: 'center' }, doneText: { ...type.bodyStrong, color: brand.void }, pressed: { opacity: 0.72 } });
