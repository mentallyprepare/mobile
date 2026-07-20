import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Moon from '../../src/components/Moon';
import Card from '../../src/components/Card';
import NightBackground from '../../src/components/NightBackground';
import { ink, font, surface, layout, moon } from '../../src/theme';
import { useMe } from '../../src/api/me';
import { useSession } from '../../src/session';

export default function Mirror() {
  const { data, loading } = useMe();
  const { signOut } = useSession();

  const archetype = data?.user?.archetype ?? null;
  const match = data?.match ?? null;
  const partnerArchetype = match?.partner?.archetype ?? null;
  const partnerSealed = data?.partnerStatus?.partnerHasWrittenToday ?? false;
  const streak = data?.streak ?? 0;

  return (
    <View style={styles.root}>
      <NightBackground />
      <SafeAreaView style={styles.screen} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.column}>
            {loading ? (
              <ActivityIndicator color={moon.present} style={styles.loader} />
            ) : (
              <>
                <Moon size={30} />
                <Text style={styles.archetype}>{archetype ?? 'not scanned yet'}</Text>
                {data?.user?.name ? (
                  <Text style={styles.archetypeLine}>{data.user.name}</Text>
                ) : null}

                {streak > 0 ? (
                  <Text style={styles.streak}>
                    {streak} {streak === 1 ? 'night' : 'nights'} in a row.
                  </Text>
                ) : null}

                {match ? (
                  <>
                    <View style={styles.divider} />
                    <Text style={styles.sectionLabel}>
                      YOUR MATCH{partnerArchetype ? ` · ${partnerArchetype.toUpperCase()}` : ''}
                    </Text>
                    <View style={styles.matchMoon}>
                      <Moon present={partnerSealed} size={30} />
                    </View>
                    <Text style={styles.matchLine}>
                      someone from another college, night {match.day} with you
                    </Text>
                  </>
                ) : null}

                <View style={styles.divider} />
                <Pressable onPress={signOut} style={styles.signOut}>
                  <Text style={styles.signOutLabel}>sign out</Text>
                </Pressable>

                {/* The Shelf is phase 4 and has no schema or endpoint yet, so
                    nothing is shown rather than inventing a shelf. */}
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  screen: { flex: 1 },
  scroll: { paddingBottom: 56 },
  column: {
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
    paddingHorizontal: layout.gutter,
    paddingTop: 46,
  },
  loader: { marginTop: 80 },
  archetype: {
    marginTop: 28,
    fontFamily: font.displayItalic,
    fontSize: 38,
    color: ink.high,
  },
  archetypeLine: {
    marginTop: 12,
    fontFamily: font.body,
    fontSize: 14,
    lineHeight: 23,
    color: ink.mid,
  },
  streak: {
    marginTop: 16,
    fontFamily: font.body,
    fontSize: 13.5,
    color: ink.faint,
  },
  sectionLabel: {
    marginTop: 34,
    fontFamily: font.body,
    fontSize: 10,
    letterSpacing: 2,
    color: ink.mid,
  },
  matchMoon: { marginTop: 20 },
  matchLine: {
    marginTop: 18,
    fontFamily: font.body,
    fontSize: 15,
    lineHeight: 24,
    color: ink.high,
  },
  divider: { height: 1, backgroundColor: surface.border, marginTop: 44 },
  signOut: { marginTop: 26, alignSelf: 'flex-start' },
  signOutLabel: {
    fontFamily: font.body,
    fontSize: 13.5,
    color: ink.mid,
  },
});
