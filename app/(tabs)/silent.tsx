import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../../src/components/Card';
import NightBackground from '../../src/components/NightBackground';
import { addManualShelfItem, getShelf, removeShelfItem, type ShelfItem } from '../../src/backend/taste';
import { font, ink, layout, moon, surface } from '../../src/theme';

export default function InnerShelf() {
  const [items, setItems] = useState<ShelfItem[]>([]);
  const [title, setTitle] = useState('');
  const [creator, setCreator] = useState('');
  const [meaning, setMeaning] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try { setItems(await getShelf()); }
    catch { setError('Your shelf could not be loaded. Try again.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    let active = true;
    getShelf()
      .then((next) => { if (active) setItems(next); })
      .catch(() => { if (active) setError('Your shelf could not be loaded. Try again.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const add = async () => {
    if (!title.trim() || saving) return;
    setSaving(true);
    setError(null);
    try {
      await addManualShelfItem({ category: 'music', title, creatorName: creator, emotionalMeaning: meaning });
      setTitle(''); setCreator(''); setMeaning('');
      await load();
    } catch { setError('This could not be saved. Nothing was added.'); }
    finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    setError(null);
    try { await removeShelfItem(id); setItems((current) => current.filter((item) => item.id !== id)); }
    catch { setError('This item could not be removed.'); }
  };

  return (
    <View style={styles.root}>
      <NightBackground />
      <SafeAreaView style={styles.screen} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.column}>
            <Text style={styles.eyebrow}>YOUR CULTURAL OBJECTS</Text>
            <Text style={styles.title}>the inner shelf.</Text>
            <Text style={styles.sub}>Collect what stays with you. New objects are private and excluded from matching by default.</Text>

            <Card style={styles.composer}>
              <Text style={styles.cardLabel}>ADD MUSIC MANUALLY</Text>
              <TextInput value={title} onChangeText={setTitle} style={styles.input} placeholder="song or album" placeholderTextColor={ink.low} maxLength={180} />
              <TextInput value={creator} onChangeText={setCreator} style={styles.input} placeholder="artist, optional" placeholderTextColor={ink.low} maxLength={180} />
              <TextInput value={meaning} onChangeText={setMeaning} style={[styles.input, styles.meaning]} placeholder="why it stays with you, optional" placeholderTextColor={ink.low} maxLength={1000} multiline />
              <Pressable accessibilityRole="button" disabled={!title.trim() || saving} onPress={add} style={[styles.addButton, (!title.trim() || saving) && styles.disabled]}>
                <Text style={styles.addLabel}>{saving ? 'saving…' : 'place on my shelf'}</Text>
              </Pressable>
            </Card>

            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
            {loading ? <ActivityIndicator color={moon.present} style={styles.loader} /> : null}
            {!loading && items.length === 0 ? (
              <View style={styles.empty}><Text style={styles.emptyTitle}>Your shelf is quiet.</Text><Text style={styles.emptyBody}>Add the first real object when you are ready.</Text></View>
            ) : null}
            {items.map((item) => (
              <Card key={item.id} style={styles.item}>
                <View style={styles.itemTop}><Text style={styles.category}>{item.category.toUpperCase()}</Text><Text style={styles.private}>PRIVATE</Text></View>
                <Text style={styles.itemTitle}>{item.title}</Text>
                {item.creatorName ? <Text style={styles.creator}>{item.creatorName}</Text> : null}
                {item.emotionalMeaning ? <Text style={styles.meaningText}>{item.emotionalMeaning}</Text> : null}
                <Pressable accessibilityRole="button" onPress={() => void remove(item.id)} style={styles.remove}><Text style={styles.removeLabel}>remove</Text></Pressable>
              </Card>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 }, screen: { flex: 1 }, scroll: { paddingBottom: 70 },
  column: { width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', paddingHorizontal: layout.gutter, paddingTop: 44 },
  eyebrow: { fontFamily: font.body, fontSize: 10, letterSpacing: 2, color: ink.mid },
  title: { marginTop: 12, fontFamily: font.displayItalic, fontSize: 36, color: ink.high },
  sub: { marginTop: 13, fontFamily: font.body, fontSize: 13, lineHeight: 21, color: ink.mid },
  composer: { marginTop: 28, padding: 20, gap: 12 }, cardLabel: { fontFamily: font.body, fontSize: 10, letterSpacing: 1.6, color: ink.mid },
  input: { minHeight: 48, borderBottomWidth: 1, borderBottomColor: surface.border, paddingHorizontal: 2, fontFamily: font.body, fontSize: 14, color: ink.high },
  meaning: { minHeight: 72, paddingTop: 14, textAlignVertical: 'top' },
  addButton: { alignSelf: 'flex-start', marginTop: 5, paddingVertical: 10, paddingHorizontal: 4 }, disabled: { opacity: 0.4 },
  addLabel: { fontFamily: font.body, fontSize: 13, color: moon.present }, error: { marginTop: 20, fontFamily: font.body, fontSize: 13, color: '#F2A8B8' },
  loader: { marginTop: 34 }, empty: { marginTop: 34, paddingVertical: 24 },
  emptyTitle: { fontFamily: font.displayItalic, fontSize: 23, color: ink.high }, emptyBody: { marginTop: 8, fontFamily: font.body, fontSize: 13, color: ink.mid },
  item: { marginTop: 18, padding: 22 }, itemTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  category: { fontFamily: font.body, fontSize: 9, letterSpacing: 1.7, color: ink.mid }, private: { fontFamily: font.body, fontSize: 9, letterSpacing: 1.4, color: moon.present },
  itemTitle: { marginTop: 16, fontFamily: font.display, fontSize: 24, color: ink.high }, creator: { marginTop: 5, fontFamily: font.body, fontSize: 12, color: ink.mid },
  meaningText: { marginTop: 18, fontFamily: font.displayItalic, fontSize: 17, lineHeight: 25, color: ink.high },
  remove: { alignSelf: 'flex-start', marginTop: 20, paddingVertical: 6 }, removeLabel: { fontFamily: font.body, fontSize: 11, color: ink.low },
});
