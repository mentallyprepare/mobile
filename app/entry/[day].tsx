import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMeShared } from '../../src/api/me-provider';
import { brand, radius, space, type } from '../../src/design';
import { t } from '../../src/i18n';
import { useLanguage } from '../../src/i18n/react';

/**
 * Your own sealed entry for a single night. Reads from data.entries — never
 * fetches anything new; if the entry isn't there, the entry never crossed
 * this device's copy of /api/me and a refresh is the right next step.
 *
 * Deliberately: reader-only. The entry cannot be edited from here (sealing
 * is one-way per the ritual). The parent Constellation and DateStrip
 * already handled the "did the user tap a locked or absent night" case,
 * but a soft empty state is here too so a URL like /entry/9 typed into a
 * dead deep link doesn't crash.
 *
 * Journey's copy promises "your private words remain outside this view" —
 * that promise is scoped to Journey. This screen is the opposite: the one
 * place your own past writing is shown back to you.
 */
export default function EntryReaderScreen() {
  const router = useRouter();
  useLanguage(); // re-render when the language changes
  const { day: dayParam } = useLocalSearchParams<{ day: string }>();
  const day = Number.parseInt(String(dayParam ?? ''), 10);
  const { data } = useMeShared();

  const entry = useMemo(() => {
    if (!Number.isFinite(day) || day < 1 || day > 21) return null;
    return data?.entries?.find((e) => e.day === day) ?? null;
  }, [data?.entries, day]);

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: `${t('entry.night_prefix')}${String(day).padStart(2, '0')}` }} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={t('entry.back_a11y')}
            hitSlop={12}
            style={({ pressed }) => [styles.back, pressed && styles.pressed]}
          >
            <Text style={styles.backLabel}>{t('entry.back')}</Text>
          </Pressable>
          <Text style={styles.title} accessibilityRole="header">
            {Number.isFinite(day) && day >= 1 && day <= 21
              ? `${t('entry.night_prefix')}${String(day).padStart(2, '0')}`
              : t('entry.invalid_title')}
          </Text>
          <Text style={styles.subtitle}>
            {entry ? t('entry.subtitle_entry') : t('entry.subtitle_empty')}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {entry ? (
            <View style={styles.card}>
              <View style={styles.metaRow}>
                <Text style={styles.night}>{t('entry.night_upper')}{String(entry.day).padStart(2, '0')}</Text>
                {entry.mood ? <Text style={styles.mood}>{entry.mood}</Text> : null}
              </View>
              <Text style={styles.text}>{entry.text}</Text>
              <Text style={styles.footer}>
                {t('entry.footer_prefix')}{formatSealed(entry.created_at)}{t('entry.footer_suffix')}
              </Text>
            </View>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>{t('entry.empty_title')}</Text>
              <Text style={styles.emptyBody}>
                {Number.isFinite(day) && day >= 1 && day <= 21
                  ? `${t('entry.night_prefix')}${day}${t('entry.empty_valid_suffix')}`
                  : t('entry.empty_invalid')}
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function formatSealed(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return t('entry.sealed_fallback');
  // The user's device timezone is honest. Doesn't invent a distant "IST
  // says…"; the ritual boundaries stay server-side, this is just when the
  // writer's own device recorded the seal.
  return d.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.void },
  safe: { flex: 1 },
  header: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: space.md,
    borderBottomWidth: 1,
    borderBottomColor: brand.line,
  },
  back: { minHeight: 44, justifyContent: 'center' },
  backLabel: { ...type.body, color: brand.inkMid },
  title: { ...type.display, color: brand.ink, fontSize: 26, lineHeight: 32, marginTop: space.sm },
  subtitle: { ...type.bodySmall, color: brand.inkMid, marginTop: space.xs },
  scroll: { padding: space.lg, paddingBottom: space.huge },
  card: {
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: brand.line,
    backgroundColor: brand.card,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.md,
  },
  night: { ...type.eyebrow, color: brand.rose, letterSpacing: 1.6, fontSize: 10 },
  mood: { fontSize: 20 },
  text: { ...type.body, color: brand.ink, lineHeight: 26 },
  footer: {
    ...type.bodySmall,
    color: brand.inkFaint,
    marginTop: space.xl,
    lineHeight: 18,
  },
  empty: { paddingVertical: space.huge, alignItems: 'center' },
  emptyTitle: { ...type.displayItalic, color: brand.ink, fontSize: 24 },
  emptyBody: {
    ...type.body,
    color: brand.inkMid,
    marginTop: space.md,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 22,
  },
  pressed: { opacity: 0.78 },
});
