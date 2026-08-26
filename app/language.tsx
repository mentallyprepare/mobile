import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { LANGUAGE_NAMES, SUPPORTED_LANGUAGES, type LanguageCode } from '../src/i18n';
import { useLanguage } from '../src/i18n/react';
import { chooseLanguage } from '../src/i18n/persistence';
import { brand, radius, space, type } from '../src/design';

/**
 * Language picker. Five supported codes; three of them (ta, bn, mr)
 * currently fall back to English at t() lookup time until their
 * dictionaries are reviewed. The picker shows them anyway with a small
 * note next to the ones that aren't fully translated yet, so the user
 * knows the choice was accepted but that some strings will still be
 * English until the translation lands.
 */
export default function LanguagePickerScreen() {
  const router = useRouter();
  const current = useLanguage();
  const [changing, setChanging] = useState<LanguageCode | null>(null);

  async function pick(code: LanguageCode) {
    if (code === current || changing) return;
    setChanging(code);
    try {
      await chooseLanguage(code);
    } finally {
      setChanging(null);
    }
  }

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: 'Language' }} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={12}
            style={({ pressed }) => [styles.back, pressed && styles.pressed]}
          >
            <Text style={styles.backLabel}>← back</Text>
          </Pressable>
          <Text style={styles.title} accessibilityRole="header">
            Language
          </Text>
          <Text style={styles.subtitle}>
            Choose the language the app should try to speak. Untranslated
            surfaces still show in English.
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.list}>
            {SUPPORTED_LANGUAGES.map((code) => {
              const selected = code === current;
              const isBusy = changing === code;
              const isPartial = code !== 'en' && code !== 'hi';
              return (
                <Pressable
                  key={code}
                  onPress={() => void pick(code)}
                  disabled={isBusy}
                  accessibilityRole="radio"
                  accessibilityState={{ selected, disabled: isBusy }}
                  accessibilityLabel={LANGUAGE_NAMES[code]}
                  style={({ pressed }) => [
                    styles.row,
                    selected && styles.rowSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={[styles.radio, selected && styles.radioSelected]}>
                    {selected ? <View style={styles.radioDot} /> : null}
                  </View>
                  <View style={styles.rowCopy}>
                    <Text style={styles.rowTitle}>{LANGUAGE_NAMES[code]}</Text>
                    <Text style={styles.rowDetail}>
                      {code.toUpperCase()}
                      {isPartial ? ' · translations coming' : ''}
                    </Text>
                  </View>
                  {isBusy ? <ActivityIndicator color={brand.rose} size="small" /> : null}
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.note}>
            The safety helpline numbers themselves are the same regardless
            of language.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
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
  subtitle: { ...type.bodySmall, color: brand.inkMid, marginTop: space.xs, lineHeight: 18 },
  scroll: { padding: space.lg, paddingBottom: space.huge },
  list: { gap: space.sm },
  row: {
    minHeight: 64,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: brand.line,
    backgroundColor: brand.card,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  rowSelected: { borderColor: brand.rose },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: brand.inkMid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: brand.rose },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: brand.rose,
  },
  rowCopy: { flex: 1 },
  rowTitle: { ...type.bodyStrong, color: brand.ink, fontSize: 16 },
  rowDetail: { ...type.bodySmall, color: brand.inkMid, marginTop: 2 },
  note: {
    ...type.bodySmall,
    color: brand.inkFaint,
    marginTop: space.xl,
    textAlign: 'center',
    lineHeight: 18,
  },
  pressed: { opacity: 0.78 },
});
