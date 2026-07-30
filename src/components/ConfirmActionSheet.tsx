import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import DaylightButton from './DaylightButton';
import { daylight, layout, radius, space, type } from '../design';

type ConfirmActionSheetProps = {
  visible: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  busy?: boolean;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmActionSheet({
  visible,
  title,
  body,
  confirmLabel,
  busy = false,
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmActionSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={busy ? undefined : onCancel}
    >
      <View style={styles.overlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={busy ? undefined : onCancel}
          accessibilityRole="button"
          accessibilityLabel="Close confirmation"
        />
        <View
          style={styles.sheet}
          accessibilityViewIsModal
          accessibilityRole="alert"
        >
          <View style={styles.handle} />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
          <View style={styles.actions}>
            <Pressable
              onPress={busy ? undefined : onConfirm}
              disabled={busy}
              accessibilityRole="button"
              accessibilityState={{ disabled: busy }}
              style={({ pressed }) => [
                styles.confirm,
                destructive && styles.destructive,
                pressed && styles.pressed,
                busy && styles.disabled,
              ]}
            >
              <Text style={styles.confirmLabel}>
                {busy ? 'one moment…' : confirmLabel}
              </Text>
            </Pressable>
            <DaylightButton
              label="cancel"
              variant="ghost"
              onPress={onCancel}
              disabled={busy}
              block
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(5,3,17,0.46)',
  },
  sheet: {
    width: '100%',
    maxWidth: layout.maxWidth + layout.gutter * 2,
    alignSelf: 'center',
    paddingHorizontal: layout.gutter,
    paddingTop: space.md,
    paddingBottom: space.xxl,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    backgroundColor: daylight.surface,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: daylight.border,
    alignSelf: 'center',
    marginBottom: space.xl,
  },
  title: { ...type.displayItalic, fontSize: 28, lineHeight: 34, color: daylight.ink },
  body: { marginTop: space.md, ...type.body, lineHeight: 23, color: daylight.inkMid },
  actions: { marginTop: space.xl, gap: space.md },
  confirm: {
    minHeight: 50,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: daylight.ink,
  },
  destructive: { backgroundColor: '#A1445A' },
  confirmLabel: { ...type.bodyStrong, fontSize: 15, color: daylight.surface },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
});
