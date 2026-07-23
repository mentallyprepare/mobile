import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DaylightCard from '../../src/components/DaylightCard';
import DaylightButton from '../../src/components/DaylightButton';
import { daylight, layout, space, type } from '../../src/design';
import { ApiError } from '../../src/api';
import {
  KIND_META,
  clearShelfItem,
  isKind,
  saveShelfItem,
  type ShelfKind,
} from '../../src/api/shelf';
import { useShelf } from '../../src/api/shelf-provider';

export default function ShelfKindScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ kind: string }>();
  const { byKind, reload } = useShelf();

  const rawKind = params.kind ?? '';
  const kind: ShelfKind | null = isKind(rawKind) ? rawKind : null;

  const existing = kind ? byKind[kind] : undefined;
  const meta = kind ? KIND_META[kind] : null;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [detail, setDetail] = useState(existing?.detail ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [piiWarned, setPiiWarned] = useState(false);

  if (!kind || !meta) {
    return (
      <SafeAreaView style={styles.root}>
        <Text style={styles.title}>not found.</Text>
      </SafeAreaView>
    );
  }

  const trimmed = title.trim();
  const canSave = trimmed.length > 0 && trimmed.length <= meta.maxTitle && !busy;

  async function onSave(confirmingPii = false) {
    if (!canSave || !kind) return;
    setBusy(true);
    setError(null);
    try {
      await saveShelfItem(kind, trimmed, detail || null, confirmingPii);
      await reload();
      router.back();
    } catch (err) {
      if (err instanceof ApiError && (err.body as any)?.code === 'pii_detected') {
        setPiiWarned(true);
        setError(err.message);
      } else {
        setError(
          err instanceof ApiError
            ? err.message
            : 'could not save this. try again in a moment.',
        );
      }
    } finally {
      setBusy(false);
    }
  }

  async function onClear() {
    if (!existing || !kind || busy) return;
    setBusy(true);
    setError(null);
    try {
      await clearShelfItem(kind);
      await reload();
      router.back();
    } catch {
      setError('could not clear this.');
    } finally {
      setBusy(false);
    }
  }

  const chars = trimmed.length;
  const remaining = meta.maxTitle - chars;

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.column}>
              <Pressable
                onPress={() => router.back()}
                accessibilityRole="button"
                accessibilityLabel="Back"
                style={styles.backBtn}
              >
                <Text style={styles.backLabel}>← back</Text>
              </Pressable>

              <Text style={styles.eyebrow}>{meta.label.toUpperCase()}</Text>
              <Text style={styles.title}>
                {existing ? 'edit.' : 'add it.'}
              </Text>

              <DaylightCard style={styles.card}>
                <Text style={styles.label}>title</Text>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder={meta.titlePlaceholder}
                  placeholderTextColor={daylight.inkLow}
                  editable={!busy}
                  maxLength={meta.maxTitle}
                  autoFocus={!existing}
                  multiline={kind === 'memory'}
                  numberOfLines={kind === 'memory' ? 3 : 1}
                  accessibilityLabel="Title"
                />
                <Text style={styles.count}>
                  {remaining} {remaining === 1 ? 'char' : 'chars'} left
                </Text>

                {meta.detailLabel ? (
                  <>
                    <Text style={[styles.label, styles.labelSpaced]}>
                      {meta.detailLabel}
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={detail}
                      onChangeText={setDetail}
                      placeholder={meta.detailPlaceholder ?? ''}
                      placeholderTextColor={daylight.inkLow}
                      editable={!busy}
                      maxLength={meta.maxDetail}
                      accessibilityLabel={meta.detailLabel}
                    />
                  </>
                ) : null}

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <View style={styles.actions}>
                  <DaylightButton
                    label={
                      busy
                        ? 'saving…'
                        : piiWarned
                          ? 'save anyway'
                          : existing
                            ? 'save'
                            : 'add to shelf'
                    }
                    onPress={() => onSave(piiWarned)}
                    disabled={!canSave}
                    block
                  />
                </View>

                {existing ? (
                  <Pressable
                    onPress={onClear}
                    accessibilityRole="button"
                    accessibilityLabel="Clear this slot"
                    style={styles.clearBtn}
                  >
                    <Text style={styles.clearLabel}>clear this slot</Text>
                  </Pressable>
                ) : null}
              </DaylightCard>

              {kind === 'memory' ? (
                <Text style={styles.footnote}>
                  memories stay private to you and the day-21 reveal. never
                  visible on discover.
                </Text>
              ) : null}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: daylight.bg },
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: { paddingVertical: space.xl },
  column: {
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
    paddingHorizontal: layout.gutter,
  },
  backBtn: { alignSelf: 'flex-start', paddingVertical: 6 },
  backLabel: { ...type.body, fontSize: 13.5, color: daylight.inkMid },
  eyebrow: {
    marginTop: space.lg,
    ...type.eyebrow,
    color: daylight.accent,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: space.sm,
    ...type.displayItalic,
    fontSize: 36,
    lineHeight: 42,
    color: daylight.ink,
  },
  card: { marginTop: space.xl, padding: space.xl },
  label: {
    ...type.eyebrow,
    color: daylight.inkMid,
    marginBottom: 8,
  },
  labelSpaced: { marginTop: space.lg },
  input: {
    minHeight: 50,
    paddingHorizontal: space.lg,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: daylight.border,
    backgroundColor: daylight.surface,
    ...type.body,
    fontSize: 15,
    color: daylight.ink,
    textAlignVertical: 'top',
  },
  count: {
    marginTop: 6,
    ...type.eyebrow,
    fontSize: 10,
    letterSpacing: 0.6,
    color: daylight.inkLow,
    textTransform: 'lowercase',
    textAlign: 'right',
  },
  error: {
    marginTop: space.lg,
    ...type.bodySmall,
    color: daylight.accentRose,
  },
  actions: { marginTop: space.xl },
  clearBtn: { marginTop: space.lg, alignSelf: 'center', paddingVertical: 6 },
  clearLabel: { ...type.body, fontSize: 13, color: daylight.accentRose },
  footnote: {
    marginTop: space.xl,
    ...type.bodySmall,
    color: daylight.inkLow,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
