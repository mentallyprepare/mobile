import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../../src/components/Card';
import NightBackground from '../../src/components/NightBackground';
import { getMobileHome, type MobileHomeData } from '../../src/backend/home';
import { font, ink, layout, moon } from '../../src/theme';

export default function MobileHome() {
  const [data, setData] = useState<MobileHomeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    getMobileHome().then((next) => { if (active) setData(next); }).catch(() => { if (active) setError('Your edition could not be loaded.'); });
    return () => { active = false; };
  }, []);
  return <View style={styles.root}><NightBackground /><SafeAreaView style={styles.screen} edges={['top']}><ScrollView contentContainerStyle={styles.scroll}><View style={styles.column}>
    <Text style={styles.eyebrow}>YOUR FINITE EDITION</Text><Text style={styles.title}>meet through what moves you.</Text><Text style={styles.sub}>A quiet social home. No infinite feed. Nothing invented.</Text>
    {!data && !error ? <ActivityIndicator color={moon.present} style={styles.loader} /> : null}
    {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    {data ? <>
      <Card style={styles.hero}><Text style={styles.cardLabel}>HELLO, {data.name.toUpperCase()}</Text><Text style={styles.heroTitle}>{data.discoveryEnabled ? 'Your social edition is open.' : 'Your profile is still private.'}</Text><Text style={styles.body}>{data.discoveryEnabled ? 'Recommendations will appear only from real eligible backend candidates.' : 'Turn on discovery later from a full privacy review. For now, keep shaping what your shelf means.'}</Text></Card>
      <View style={styles.metrics}><Card style={styles.metric}><Text style={styles.metricNumber}>{data.musicCount}</Text><Text style={styles.meta}>music objects</Text></Card><Card style={styles.metric}><Text style={styles.metricNumber}>{data.intentionCount}</Text><Text style={styles.meta}>social intentions</Text></Card></View>
      <Card style={styles.card}><Text style={styles.cardLabel}>TODAY&apos;S SOCIAL EDITION</Text><Text style={styles.cardTitle}>{data.discoveryEnabled ? 'No recommendations are ready yet.' : 'Discovery is off.'}</Text><Text style={styles.body}>{data.discoveryEnabled ? 'The backend has not returned a real recommendation. This space stays empty instead of showing a placeholder person.' : 'Your objects, notes, and matching choices remain stored without making you visible.'}</Text></Card>
      <Card style={styles.card}><Text style={styles.cardLabel}>DEEP CONNECTION</Text><Text style={styles.cardTitle}>{data.activeRoom ? `Night ${data.activeRoom.currentNight ?? '—'} with ${data.activeRoom.partnerPseudonym}` : 'No active room.'}</Text><Text style={styles.body}>{data.activeRoom ? (data.activeRoom.partnerHasSealed ? 'Your room partner has sealed something tonight.' : 'Your room is quiet right now.') : 'The 21-night ritual begins only after mutual interest. It is no longer forced at account creation.'}</Text></Card>
    </> : null}
  </View></ScrollView></SafeAreaView></View>;
}

const styles = StyleSheet.create({
  root: { flex: 1 }, screen: { flex: 1 }, scroll: { paddingBottom: 72 }, column: { width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', paddingHorizontal: layout.gutter, paddingTop: 46 }, eyebrow: { fontFamily: font.body, fontSize: 10, letterSpacing: 2, color: ink.mid }, title: { marginTop: 14, fontFamily: font.displayItalic, fontSize: 37, lineHeight: 44, color: ink.high }, sub: { marginTop: 12, fontFamily: font.body, fontSize: 13, lineHeight: 21, color: ink.mid }, loader: { marginTop: 50 }, error: { marginTop: 28, fontFamily: font.body, fontSize: 13, color: '#F2A8B8' }, hero: { marginTop: 30, padding: 24 }, heroTitle: { marginTop: 16, fontFamily: font.display, fontSize: 27, lineHeight: 34, color: ink.high }, cardLabel: { fontFamily: font.body, fontSize: 9.5, letterSpacing: 1.7, color: ink.mid }, body: { marginTop: 12, fontFamily: font.body, fontSize: 12.5, lineHeight: 20, color: ink.mid }, metrics: { flexDirection: 'row', gap: 12, marginTop: 14 }, metric: { flex: 1, padding: 18 }, metricNumber: { fontFamily: font.display, fontSize: 31, color: ink.high }, meta: { marginTop: 5, fontFamily: font.body, fontSize: 10.5, color: ink.mid }, card: { marginTop: 14, padding: 22 }, cardTitle: { marginTop: 14, fontFamily: font.display, fontSize: 23, color: ink.high },
});
