import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import DaylightScreen from '../../src/components/DaylightScreen';
import { daylight, space, type } from '../../src/design';
import { useMeShared } from '../../src/api/me-provider';

/**
 * Home. Stripped 27 Jul on Anushka's ask: no hero illustration, no wellness
 * copy, no eyebrows, no purple gradient card. Only what is true right now.
 * Two elements max. Written copy is a placeholder marker — Anushka replaces
 * with her own words; Claude does not write app-voice text here.
 */
export default function Home() {
  const { data, loading } = useMeShared();
  const router = useRouter();

  if (loading) {
    return (
      <DaylightScreen>
        <ActivityIndicator color={daylight.ink} style={{ marginTop: space.huge }} />
      </DaylightScreen>
    );
  }

  const archetype = data?.user?.archetype ?? null;
  const match = data?.match ?? null;
  const night = match?.day ?? null;

  // Active room: one line, tap opens the room.
  if (match && night) {
    return (
      <DaylightScreen>
        <Pressable
          onPress={() => router.push('/rooms')}
          accessibilityRole="button"
          accessibilityLabel={`Night ${night} of 21`}
          style={styles.line}
        >
          <Text style={styles.night}>night {night} of 21</Text>
        </Pressable>
      </DaylightScreen>
    );
  }

  // No scan yet: one small link, no card, no illustration.
  if (!archetype) {
    return (
      <DaylightScreen>
        <Pressable
          onPress={() => router.push('/scan')}
          accessibilityRole="button"
          accessibilityLabel="Take the scan"
          style={styles.line}
        >
          <Text style={styles.link}>take the scan</Text>
        </Pressable>
      </DaylightScreen>
    );
  }

  // Scanned, no match yet: nothing. Deliberate blank.
  return <DaylightScreen />;
}

const styles = StyleSheet.create({
  line: { paddingVertical: space.md },
  night: {
    ...type.displayItalic,
    fontSize: 32,
    lineHeight: 40,
    color: daylight.ink,
  },
  link: {
    ...type.body,
    fontSize: 15,
    color: daylight.ink,
    textDecorationLine: 'underline',
  },
});
