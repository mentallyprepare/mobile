import { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { brand, radius, space, type } from '../../design';
import { t } from '../../i18n';
import { useLanguage } from '../../i18n/react';

export type QuickAction = 'write' | 'check-in' | 'reflection' | 'journey';

export default function QuickActionSheet({
  visible,
  onClose,
  onAction,
}: {
  visible: boolean;
  onClose: () => void;
  onAction: (action: QuickAction) => void;
}) {
  useLanguage(); // re-render when the language changes
  const insets = useSafeAreaInsets();
  const [translateY] = useState(() => new Animated.Value(420));
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!visible) return;
    if (reduceMotion) {
      translateY.setValue(0);
      return;
    }
    translateY.setValue(420);
    Animated.spring(translateY, {
      toValue: 0,
      damping: 24,
      stiffness: 230,
      mass: 0.9,
      useNativeDriver: true,
    }).start();
  }, [reduceMotion, translateY, visible]);

  const actions: { id: QuickAction; title: string; detail: string }[] = [
    { id: 'write',      title: t('quick_actions.write_title'),      detail: t('quick_actions.write_detail') },
    { id: 'check-in',   title: t('quick_actions.checkin_title'),    detail: t('quick_actions.checkin_detail') },
    { id: 'reflection', title: t('quick_actions.reflection_title'), detail: t('quick_actions.reflection_detail') },
    { id: 'journey',    title: t('quick_actions.journey_title'),    detail: t('quick_actions.journey_detail') },
  ];

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          style={styles.backdrop}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t('quick_actions.dismiss_all_a11y')}
        />
        <Animated.View
          accessibilityViewIsModal
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, space.lg), transform: [{ translateY }] }]}
        >
          <View style={styles.handle} />
          <Text style={styles.kicker}>{t('quick_actions.kicker')}</Text>
          <Text style={styles.title}>{t('quick_actions.title')}</Text>
          {actions.map((action) => (
            <Pressable
              key={action.id}
              onPress={() => onAction(action.id)}
              accessibilityRole="button"
              accessibilityLabel={action.title}
              accessibilityHint={action.detail}
              style={({ pressed }) => [styles.action, pressed && styles.pressed]}
            >
              <View style={styles.actionCopy}>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.actionDetail}>{action.detail}</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </Pressable>
          ))}
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={t('quick_actions.dismiss_a11y')}
            style={({ pressed }) => [styles.dismiss, pressed && styles.pressed]}
          >
            <Text style={styles.dismissText}>{t('quick_actions.dismiss')}</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(8,5,15,0.72)' },
  sheet: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    backgroundColor: brand.card,
    borderWidth: 1,
    borderColor: brand.line,
  },
  handle: { width: 38, height: 4, borderRadius: 2, alignSelf: 'center', backgroundColor: brand.inkFaint },
  kicker: { ...type.eyebrow, color: brand.rose, fontSize: 8, marginTop: space.lg },
  title: { ...type.displayItalic, color: brand.ink, fontSize: 28, lineHeight: 34, marginTop: space.xs },
  action: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: space.md,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    backgroundColor: brand.surface,
    borderWidth: 1,
    borderColor: brand.line,
  },
  actionCopy: { flex: 1 },
  actionTitle: { ...type.bodyStrong, color: brand.ink },
  actionDetail: { ...type.bodySmall, color: brand.inkMid, marginTop: 2 },
  arrow: { color: brand.gold, fontSize: 20 },
  dismiss: { minHeight: 48, alignItems: 'center', justifyContent: 'center', marginTop: space.md },
  dismissText: { ...type.bodyStrong, color: brand.inkMid },
  pressed: { opacity: 0.72 },
});
