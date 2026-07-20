import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Moon from '../../src/components/Moon';
import NightBackground from '../../src/components/NightBackground';
import { ink, font, surface, layout, moon } from '../../src/theme';
import { useSession } from '../../src/session';
import { getProfileSummary, type ProfileSummary } from '../../src/backend/profile';

export default function Mirror() {
  const [data, setData] = useState<ProfileSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { signOut } = useSession();

  useEffect(() => {
    let active = true;
    getProfileSummary()
      .then((next) => { if (active) setData(next); })
      .catch(() => { if (active) setData(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <View style={styles.root}>
      <NightBackground />
      <SafeAreaView style={styles.screen} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.column}>
            {loading ? <ActivityIndicator color={moon.present} style={styles.loader} /> : (
              <>
                <Moon size={30} />
                <Text style={styles.name}>{data?.anonymousName || 'your inner world'}</Text>
                <Text style={styles.note}>private by default.</Text>
                {data?.partnerPseudonym ? (
                  <>
                    <View style={styles.divider} />
                    <Text style={styles.sectionLabel}>YOUR MATCH · {data.partnerPseudonym.toUpperCase()}</Text>
                    <View style={styles.matchMoon}><Moon present={data.partnerHasSealed} size={30} /></View>
                    <Text style={styles.matchLine}>night {data.currentNight} with you</Text>
                  </>
                ) : null}
                <View style={styles.divider} />
                <Pressable onPress={signOut} style={styles.signOut}>
                  <Text style={styles.signOutLabel}>sign out</Text>
                </Pressable>
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 }, screen: { flex: 1 }, scroll: { paddingBottom: 56 },
  column: { width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', paddingHorizontal: layout.gutter, paddingTop: 46 },
  loader: { marginTop: 80 },
  name: { marginTop: 28, fontFamily: font.displayItalic, fontSize: 38, color: ink.high },
  note: { marginTop: 12, fontFamily: font.body, fontSize: 14, lineHeight: 23, color: ink.mid },
  sectionLabel: { marginTop: 34, fontFamily: font.body, fontSize: 10, letterSpacing: 2, color: ink.mid },
  matchMoon: { marginTop: 20 },
  matchLine: { marginTop: 18, fontFamily: font.body, fontSize: 15, lineHeight: 24, color: ink.high },
  divider: { height: 1, backgroundColor: surface.border, marginTop: 44 },
  signOut: { marginTop: 26, alignSelf: 'flex-start' },
  signOutLabel: { fontFamily: font.body, fontSize: 13.5, color: ink.mid },
});
