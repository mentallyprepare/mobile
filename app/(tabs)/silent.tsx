import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../../src/components/Card';
import NightBackground from '../../src/components/NightBackground';
import PrimaryButton from '../../src/components/PrimaryButton';
import Reveal from '../../src/components/Reveal';
import { addManualShelfItem, getShelf, removeShelfItem, type ShelfItem } from '../../src/backend/taste';
import { cosmos, font, ink, layout, moon, radius, sky, surface } from '../../src/theme';

export default function InnerShelf() {
  const [items, setItems] = useState<ShelfItem[]>([]);
  const [title, setTitle] = useState('');
  const [creator, setCreator] = useState('');
  const [meaning, setMeaning] = useState('');
  const [composerOpen, setComposerOpen] = useState(false);
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
      setTitle(''); setCreator(''); setMeaning(''); setComposerOpen(false);
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
        <Reveal>
          <ScrollView contentContainerStyle={styles.scroll} contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.column}>
              <View style={styles.topline}><Text style={styles.eyebrow}>YOUR PRIVATE COLLECTION</Text><View style={styles.countPill}><Text accessibilityLiveRegion="polite" style={styles.countText}>{items.length} {items.length === 1 ? 'OBJECT' : 'OBJECTS'}</Text></View></View>
              <Text accessibilityRole="header" style={styles.title}>the inner shelf.</Text>
              <Text style={styles.sub}>A finite collection of music that says something about you. Every new object begins private and outside matching.</Text>

              <Card accent style={styles.promise}>
                <View style={styles.promiseIcon}><Text style={styles.promiseGlyph}>◌</Text></View>
                <View style={styles.promiseCopy}><Text style={styles.promiseTitle}>Private by construction</Text><Text style={styles.promiseBody}>Personal notes stay yours and are never shown in matching explanations.</Text></View>
              </Card>

              <Pressable accessibilityRole="button" accessibilityState={{ expanded: composerOpen }} onPress={() => setComposerOpen((value) => !value)} style={({ pressed }) => [styles.addShelfButton, pressed && styles.pressed]}>
                <View style={styles.addIcon}><Text style={styles.addIconText}>{composerOpen ? '−' : '+'}</Text></View>
                <View style={styles.addCopy}><Text style={styles.addTitle}>{composerOpen ? 'close music entry' : 'add something that stayed'}</Text><Text style={styles.addMeta}>Music only for this backend slice</Text></View>
              </Pressable>

              {composerOpen ? (
                <Card style={styles.composer}>
                  <Text style={styles.cardLabel}>PLACE MUSIC ON YOUR SHELF</Text>
                  <TextInput accessibilityLabel="Song or album title" value={title} onChangeText={setTitle} style={styles.input} placeholder="Song or album" placeholderTextColor={ink.low} maxLength={180} />
                  <TextInput accessibilityLabel="Artist, optional" value={creator} onChangeText={setCreator} style={styles.input} placeholder="Artist, optional" placeholderTextColor={ink.low} maxLength={180} />
                  <TextInput accessibilityLabel="Personal meaning, optional" value={meaning} onChangeText={setMeaning} style={[styles.input, styles.meaning]} placeholder="Why it stays with you, optional" placeholderTextColor={ink.low} maxLength={1000} multiline />
                  <View style={styles.privateDefaults}><Text style={styles.privateDefaultsText}>PRIVATE · EXCLUDED FROM MATCHING</Text></View>
                  <PrimaryButton block disabled={!title.trim() || saving} onPress={add} label={saving ? 'saving privately…' : 'place on my shelf'} />
                </Card>
              ) : null}

              {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
              {loading ? <ActivityIndicator accessibilityLabel="Loading your shelf" color={moon.present} style={styles.loader} /> : null}
              {!loading && items.length === 0 ? (
                <View style={styles.empty}><View style={styles.emptyOrbit}><Text style={styles.emptyNote}>♫</Text></View><Text style={styles.emptyTitle}>Your shelf is waiting.</Text><Text style={styles.emptyBody}>Not an empty state to fill quickly. Add the first real object when it feels right.</Text></View>
              ) : null}

              <View style={styles.shelf}>
                {items.map((item, index) => (
                  <View key={item.id} style={styles.shelfSlot}>
                    <View style={styles.shelfNumber}><Text style={styles.shelfNumberText}>{String(index + 1).padStart(2, '0')}</Text></View>
                    <Card style={styles.item}>
                      <View style={styles.itemTop}><Text style={styles.category}>{item.category.toUpperCase()}</Text><View style={styles.statuses}><Text style={styles.private}>PRIVATE</Text><Text style={styles.excluded}>MATCHING OFF</Text></View></View>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      {item.creatorName ? <Text style={styles.creator}>{item.creatorName}</Text> : null}
                      {item.emotionalMeaning ? <View style={styles.meaningBlock}><Text style={styles.meaningLabel}>WHY IT STAYED</Text><Text style={styles.meaningText}>{item.emotionalMeaning}</Text></View> : null}
                      <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${item.title} from shelf`} hitSlop={8} onPress={() => void remove(item.id)} style={({ pressed }) => [styles.remove, pressed && styles.pressed]}><Text style={styles.removeLabel}>remove from shelf</Text></Pressable>
                    </Card>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>
        </Reveal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 }, screen: { flex: 1 }, scroll: { paddingBottom: 92 },
  column: { width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', paddingHorizontal: layout.gutter, paddingTop: 36 },
  topline: { flexDirection: 'row', alignItems: 'center' },
  eyebrow: { fontFamily: font.bodyStrong, fontSize: 9, letterSpacing: 1.8, color: cosmos.lavender },
  countPill: { marginLeft: 'auto', borderRadius: radius.pill, borderWidth: StyleSheet.hairlineWidth, borderColor: surface.border, paddingHorizontal: 10, paddingVertical: 6 },
  countText: { fontFamily: font.bodyStrong, fontSize: 8, letterSpacing: 1, color: ink.mid },
  title: { marginTop: 13, fontFamily: font.displayItalic, fontSize: 42, lineHeight: 47, color: ink.high },
  sub: { marginTop: 13, fontFamily: font.body, fontSize: 13, lineHeight: 21, color: ink.mid },
  promise: { marginTop: 24, padding: 17, flexDirection: 'row', gap: 13, alignItems: 'center' },
  promiseIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(156,205,184,0.08)', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(156,205,184,0.24)' },
  promiseGlyph: { fontFamily: font.display, fontSize: 24, color: cosmos.success },
  promiseCopy: { flex: 1 }, promiseTitle: { fontFamily: font.bodyStrong, fontSize: 11.5, color: ink.high },
  promiseBody: { marginTop: 4, fontFamily: font.body, fontSize: 10.5, lineHeight: 16, color: ink.mid },
  addShelfButton: { minHeight: 70, marginTop: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', borderRadius: radius.medium, borderWidth: 1, borderColor: 'rgba(201,190,255,0.20)', backgroundColor: 'rgba(248,242,255,0.028)' },
  addIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: cosmos.lilac },
  addIconText: { fontFamily: font.bodyStrong, fontSize: 20, color: sky.late },
  addCopy: { marginLeft: 13, flex: 1 }, addTitle: { fontFamily: font.bodyStrong, fontSize: 12.5, color: ink.high },
  addMeta: { marginTop: 4, fontFamily: font.body, fontSize: 9.5, color: ink.mid },
  composer: { marginTop: 12, padding: 20, gap: 12 }, cardLabel: { fontFamily: font.bodyStrong, fontSize: 9, letterSpacing: 1.5, color: ink.mid },
  input: { minHeight: 52, borderRadius: radius.medium, borderWidth: 1, borderColor: surface.border, backgroundColor: 'rgba(5,3,17,0.26)', paddingHorizontal: 15, fontFamily: font.body, fontSize: 14, color: ink.high },
  meaning: { minHeight: 88, paddingTop: 14, textAlignVertical: 'top' },
  privateDefaults: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: 'rgba(156,205,184,0.07)' },
  privateDefaultsText: { fontFamily: font.bodyStrong, fontSize: 8, letterSpacing: 1, color: cosmos.success },
  error: { marginTop: 20, fontFamily: font.body, fontSize: 13, lineHeight: 20, color: cosmos.danger },
  loader: { marginTop: 34 },
  empty: { marginTop: 42, alignItems: 'center', paddingVertical: 26 },
  emptyOrbit: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(201,190,255,0.16)', backgroundColor: 'rgba(127,90,142,0.08)' },
  emptyNote: { fontFamily: font.display, fontSize: 30, color: cosmos.lilac },
  emptyTitle: { marginTop: 18, fontFamily: font.displayItalic, fontSize: 25, color: ink.high },
  emptyBody: { marginTop: 8, maxWidth: 270, textAlign: 'center', fontFamily: font.body, fontSize: 12, lineHeight: 19, color: ink.mid },
  shelf: { marginTop: 16 }, shelfSlot: { position: 'relative', paddingLeft: 13, marginTop: 16 },
  shelfNumber: { position: 'absolute', left: 0, top: 20, zIndex: 2, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: cosmos.lilac, borderWidth: 3, borderColor: sky.late },
  shelfNumberText: { fontFamily: font.bodyStrong, fontSize: 8, color: sky.late },
  item: { padding: 22, paddingLeft: 27 }, itemTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  category: { fontFamily: font.bodyStrong, fontSize: 8.5, letterSpacing: 1.6, color: ink.mid },
  statuses: { marginLeft: 'auto', alignItems: 'flex-end', gap: 4 },
  private: { fontFamily: font.bodyStrong, fontSize: 8, letterSpacing: 1.1, color: cosmos.success },
  excluded: { fontFamily: font.bodyStrong, fontSize: 7, letterSpacing: 0.8, color: ink.faint },
  itemTitle: { marginTop: 16, fontFamily: font.display, fontSize: 27, lineHeight: 32, color: ink.high },
  creator: { marginTop: 5, fontFamily: font.body, fontSize: 11.5, color: ink.mid },
  meaningBlock: { marginTop: 20, paddingTop: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: surface.border },
  meaningLabel: { fontFamily: font.bodyStrong, fontSize: 8, letterSpacing: 1.3, color: ink.faint },
  meaningText: { marginTop: 8, fontFamily: font.displayItalic, fontSize: 18, lineHeight: 25, color: ink.high },
  remove: { minHeight: 44, alignSelf: 'flex-start', justifyContent: 'center', marginTop: 12 },
  removeLabel: { fontFamily: font.body, fontSize: 10.5, color: ink.low },
  pressed: { opacity: 0.7 },
});
