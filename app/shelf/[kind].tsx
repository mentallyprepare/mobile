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
import AppBackdrop from '../../src/components/app/AppBackdrop';
import ShelfCover from '../../src/components/shelf/ShelfCover';
import { brand, layout, radius, space, type } from '../../src/design';
import { ApiError } from '../../src/api';
import {
  KIND_META,
  clearShelfItem,
  isKind,
  saveShelfItem,
  type ShelfItem,
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
      <View style={styles.root}>
        <AppBackdrop />
        <SafeAreaView style={styles.safe}>
          <Text style={styles.title}>This shelf slot was not found.</Text>
        </SafeAreaView>
      </View>
    );
  }

  const trimmed = title.trim();
  const canSave = trimmed.length > 0 && trimmed.length <= meta.maxTitle && !busy;
  const chars = trimmed.length;
  const remaining = meta.maxTitle - chars;
  const preview: ShelfItem | undefined = trimmed
    ? {
        kind,
        title: trimmed,
        detail: detail.trim() || null,
        artworkUrl: existing?.artworkUrl ?? null,
        updatedAt: existing?.updatedAt ?? '',
      }
    : undefined;

  async function onSave(confirmingPii = false) {
    if (!canSave || !kind) return;
    setBusy(true);
    setError(null);
    try {
      await saveShelfItem(kind, trimmed, detail || null, confirmingPii);
      await reload();
      router.back();
    } catch (err) {
      if (err instanceof ApiError && (err.body as { code?: string })?.code === 'pii_detected') {
        setPiiWarned(true);
        setError(err.message);
      } else {
        setError(err instanceof ApiError ? err.message : 'Could not save this. Try again.');
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
      setError('Could not clear this slot.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.root}>
      <AppBackdrop />
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
                style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
              >
                <Text style={styles.backLabel}>← Shelf</Text>
              </Pressable>

              <Text style={styles.eyebrow}>{meta.label.toUpperCase()}</Text>
              <Text style={styles.title}>{existing ? 'Keep the meaning true' : 'Choose one that stays'}</Text>
              <Text style={styles.subtitle}>
                This object is part of your private inner shelf, not a public profile.
              </Text>

              <View pointerEvents="none" style={styles.preview}>
                <ShelfCover
                  kind={kind}
                  item={preview}
                  available
                  index={1}
                  wide={kind === 'memory'}
                  style={kind === 'memory' ? styles.previewWide : styles.previewCover}
                  onPress={() => undefined}
                />
              </View>

              <View style={styles.panel}>
                <Text style={styles.label}>TITLE</Text>
                <TextInput
                  style={[styles.input, kind === 'memory' && styles.inputMemory]}
                  value={title}
                  onChangeText={setTitle}
                  placeholder={meta.titlePlaceholder}
                  placeholderTextColor={brand.inkLow}
                  editable={!busy}
                  maxLength={meta.maxTitle}
                  autoFocus={!existing}
                  multiline={kind === 'memory'}
                  numberOfLines={kind === 'memory' ? 3 : 1}
                  accessibilityLabel="Title"
                />
                <Text style={styles.count}>{remaining} characters left</Text>

                {meta.detailLabel ? (
                  <>
                    <Text style={[styles.label, styles.labelSpaced]}>
                      {meta.detailLabel.toUpperCase()}
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={detail}
                      onChangeText={setDetail}
                      placeholder={meta.detailPlaceholder ?? ''}
                      placeholderTextColor={brand.inkLow}
                      editable={!busy}
                      maxLength={meta.maxDetail}
                      accessibilityLabel={meta.detailLabel}
                    />
                  </>
                ) : null}

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <Pressable
                  onPress={() => onSave(piiWarned)}
                  disabled={!canSave}
                  accessibilityRole="button"
                  accessibilityLabel={existing ? 'Save shelf item' : 'Add to shelf'}
                  style={({ pressed }) => [
                    styles.save,
                    !canSave && styles.saveDisabled,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.saveLabel}>
                    {busy
                      ? 'Saving…'
                      : piiWarned
                        ? 'Save anyway'
                        : existing
                          ? 'Save changes'
                          : 'Add to my shelf'}
                  </Text>
                  <Text style={styles.saveArrow}>→</Text>
                </Pressable>

                {existing ? (
                  <Pressable
                    onPress={onClear}
                    accessibilityRole="button"
                    accessibilityLabel="Clear this slot"
                    style={({ pressed }) => [styles.clearBtn, pressed && styles.pressed]}
                  >
                    <Text style={styles.clearLabel}>Remove from shelf</Text>
                  </Pressable>
                ) : null}
              </View>

              {kind === 'memory' ? (
                <Text style={styles.footnote}>
                  Memories remain private to you and the day-21 reveal. Never visible in discovery.
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
  root: { flex: 1, backgroundColor: brand.void },
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: { paddingVertical: space.lg },
  column: {
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
    paddingHorizontal: layout.gutter,
  },
  backBtn: { alignSelf: 'flex-start', paddingVertical: 8 },
  backLabel: { ...type.bodyStrong, fontSize: 13.5, color: brand.rose },
  eyebrow: {
    marginTop: space.lg,
    ...type.eyebrow,
    color: brand.rose,
    letterSpacing: 1.4,
  },
  title: {
    marginTop: space.sm,
    ...type.display,
    fontSize: 36,
    lineHeight: 41,
    color: brand.ink,
  },
  subtitle: { ...type.body, color: brand.inkMid, marginTop: 4 },
  preview: { alignItems: 'center', marginTop: space.xl },
  previewCover: { width: 184, height: 226 },
  previewWide: { width: '100%' },
  panel: {
    marginTop: space.xl,
    padding: space.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: brand.line,
    backgroundColor: brand.card,
  },
  label: { ...type.eyebrow, color: brand.rose, fontSize: 8.5, letterSpacing: 1.2 },
  labelSpaced: { marginTop: space.lg },
  input: {
    minHeight: 52,
    marginTop: space.sm,
    paddingHorizontal: space.lg,
    paddingVertical: 13,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: brand.line,
    backgroundColor: brand.void,
    ...type.body,
    fontSize: 15,
    color: brand.ink,
    textAlignVertical: 'top',
  },
  inputMemory: { minHeight: 96 },
  count: {
    marginTop: 6,
    ...type.bodySmall,
    fontSize: 10,
    color: brand.inkLow,
    textAlign: 'right',
  },
  error: { marginTop: space.lg, ...type.bodySmall, color: brand.rose },
  save: {
    minHeight: 52,
    marginTop: space.xl,
    paddingHorizontal: space.lg,
    borderRadius: radius.md,
    backgroundColor: brand.rose,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  saveDisabled: { opacity: 0.35 },
  saveLabel: { ...type.bodyStrong, color: brand.void },
  saveArrow: { color: brand.void, fontSize: 19 },
  clearBtn: { marginTop: space.lg, alignSelf: 'center', paddingVertical: 6 },
  clearLabel: { ...type.bodySmall, color: brand.rose },
  footnote: {
    marginTop: space.xl,
    ...type.bodySmall,
    color: brand.inkLow,
    lineHeight: 18,
    textAlign: 'center',
  },
  pressed: { opacity: 0.72 },
});
