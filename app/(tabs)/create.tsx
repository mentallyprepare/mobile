import { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import DaylightScreen from '../../src/components/DaylightScreen';
import DaylightCard from '../../src/components/DaylightCard';
import Illustration from '../../src/components/Illustration';
import { daylight, radius, space, type } from '../../src/design';
import { useMeShared } from '../../src/api/me-provider';
import { useShelf } from '../../src/api/shelf-provider';
import { KIND_META, SHELF_KINDS, type ShelfKind } from '../../src/api/shelf';

/**
 * Create is contextual. When a Room is active, tapping Create immediately
 * routes to tonight's writing. Otherwise it lands on the shelf chooser: one
 * row per kind, filled row shows current title, empty row invites "add."
 * See docs/design-daylight-world.md.
 */
export default function Create() {
  const { data } = useMeShared();
  const { byKind, loading } = useShelf();
  const router = useRouter();
  const inRoom = !!data?.match;

  useFocusEffect(
    useCallback(() => {
      if (inRoom) router.replace('/rooms');
    }, [inRoom, router]),
  );
  useEffect(() => {
    if (inRoom) router.replace('/rooms');
  }, [inRoom, router]);

  if (inRoom) return <DaylightScreen><View /></DaylightScreen>;

  return (
    <DaylightScreen>
      <Text style={styles.title}>your shelf.</Text>
      <Text style={styles.sub}>
        the songs, films, books and memories that are honestly you.
      </Text>

      {loading ? (
        <ActivityIndicator color={daylight.accent} style={{ marginTop: space.xl }} />
      ) : (
        <View style={styles.list}>
          {SHELF_KINDS.map((kind) => (
            <ShelfRow key={kind} kind={kind} filled={byKind[kind]} />
          ))}
        </View>
      )}
    </DaylightScreen>
  );
}

function ShelfRow({
  kind,
  filled,
}: {
  kind: ShelfKind;
  filled: { title: string; detail: string | null } | undefined;
}) {
  const router = useRouter();
  const meta = KIND_META[kind];
  const available = kind === 'song_a' || kind === 'song_b' || kind === 'memory';
  const label = !available ? `${meta.label} — coming later` : filled ? meta.label : `add ${meta.label}`;

  return (
    <Pressable
      onPress={() => available && router.push({ pathname: '/shelf/[kind]', params: { kind } })}
      accessibilityRole="button"
      accessibilityLabel={filled ? `edit ${meta.label}: ${filled.title}` : label}
      disabled={!available}
      style={({ pressed }) => [styles.row, !available && styles.rowDisabled, pressed && styles.rowPressed]}
    >
      <View style={[styles.kindDot, filled && styles.kindDotOn]} />
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        {filled ? (
          <Text style={styles.rowTitle} numberOfLines={1}>
            {filled.title}
            {filled.detail ? <Text style={styles.rowDetail}>{'  ·  '}{filled.detail}</Text> : null}
          </Text>
        ) : null}
      </View>
      <Text style={styles.arrow}>{!available ? 'later' : filled ? 'edit' : 'add'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: { ...type.displayItalic, color: daylight.ink },
  sub: { ...type.body, color: daylight.inkMid, marginTop: space.sm },
  list: { marginTop: space.xl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: space.lg,
    paddingHorizontal: space.lg,
    borderRadius: radius.lg,
    backgroundColor: daylight.surface,
    borderWidth: 1,
    borderColor: daylight.border,
    marginBottom: space.md,
    gap: space.lg,
  },
  rowPressed: { opacity: 0.85 },
  rowDisabled: { opacity: 0.58 },
  kindDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: daylight.border,
  },
  kindDotOn: { backgroundColor: daylight.accent },
  rowText: { flex: 1 },
  rowLabel: {
    ...type.eyebrow,
    fontSize: 10,
    letterSpacing: 1.2,
    color: daylight.inkMid,
    textTransform: 'uppercase',
  },
  rowTitle: {
    ...type.body,
    fontSize: 15,
    lineHeight: 22,
    color: daylight.ink,
    marginTop: 3,
  },
  rowDetail: { color: daylight.inkMid },
  arrow: {
    ...type.eyebrow,
    fontSize: 11,
    color: daylight.accent,
    letterSpacing: 1,
    textTransform: 'lowercase',
  },
});
