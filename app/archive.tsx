import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import CosmicScreen from '../src/components/app/CosmicScreen';
import { api } from '../src/api';
import { brand, space } from '../src/design';
import { t } from '../src/i18n';
import { useLanguage } from '../src/i18n/react';

type ArchivedNote = { label: string; text: string };

function parseArchive(value: unknown): ArchivedNote[] {
  if (!value || typeof value !== 'object') return [];
  const data = value as { journeys?: unknown; standalone?: unknown };
  const notes: ArchivedNote[] = [];
  if (Array.isArray(data.journeys)) {
    for (const journey of data.journeys) {
      if (!journey || !Array.isArray(journey.entries)) continue;
      for (const entry of journey.entries) {
        if (typeof entry?.text === 'string') notes.push({ label: `${t('you.archive_day')} ${Number(entry.day) || 1}`, text: entry.text });
      }
    }
  }
  if (Array.isArray(data.standalone)) {
    for (const item of data.standalone) {
      if (!['waiting', 'tonights_question', 'daily_note'].includes(item?.source)) continue;
      const text = item.record?.text || item.record?.landed;
      if (typeof text === 'string' && text.trim()) notes.push({ label: t('you.archive_reflection'), text });
    }
  }
  return notes;
}

export default function PreviousJourneys() {
  useLanguage();
  const router = useRouter();
  const [notes, setNotes] = useState<ArchivedNote[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    api.request<unknown>('/api/journey/archive')
      .then((result) => { if (active) setNotes(parseArchive(result)); })
      .catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, []);

  return (
    <CosmicScreen>
      <Pressable onPress={() => router.back()} accessibilityRole="button" style={styles.back}>
        <Text style={styles.backText}>← {t('you.archive_back')}</Text>
      </Pressable>
      <Text style={styles.eyebrow}>{t('you.archive_eyebrow')}</Text>
      <Text style={styles.title}>{t('you.archive_title')}</Text>
      <Text style={styles.detail}>{t('you.archive_detail')}</Text>
      {failed ? <Text style={styles.detail}>{t('you.archive_error')}</Text> : null}
      {!failed && notes === null ? <Text style={styles.detail}>…</Text> : null}
      {!failed && notes?.length === 0 ? <Text style={styles.detail}>{t('you.archive_empty')}</Text> : null}
      {notes?.map((note, index) => (
        <View key={`${index}-${note.label}`} style={styles.card}>
          <Text style={styles.label}>{note.label}</Text>
          <Text style={styles.note}>{note.text}</Text>
        </View>
      ))}
    </CosmicScreen>
  );
}

const styles = StyleSheet.create({
  back: { marginTop: space.lg, marginBottom: space.xl },
  backText: { color: brand.rose, fontSize: 14 },
  eyebrow: { color: brand.rose, fontSize: 11, letterSpacing: 2, marginBottom: 10 },
  title: { color: brand.ink, fontFamily: 'InstrumentSerif_400Regular', fontSize: 38 },
  detail: { color: brand.inkMid, fontSize: 14, lineHeight: 21, marginTop: 12, marginBottom: 14 },
  card: { backgroundColor: brand.card, borderWidth: 1, borderColor: brand.line, borderRadius: 8, padding: 18, marginTop: 12 },
  label: { color: brand.rose, fontSize: 12, marginBottom: 8 },
  note: { color: brand.ink, fontSize: 15, lineHeight: 23 },
});
