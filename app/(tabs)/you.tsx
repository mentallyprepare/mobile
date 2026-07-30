import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import CosmicScreen from '../../src/components/app/CosmicScreen';
import InnerUniverseScene from '../../src/components/profile/InnerUniverseScene';
import ShelfStrip from '../../src/components/shelf/ShelfStrip';
import {
  LoadFailure,
  LoadPlaceholder,
  StaleNotice,
} from '../../src/components/app/LoadFailure';
import { brand, radius, space, type } from '../../src/design';
import { useMeShared } from '../../src/api/me-provider';
import { useShelf } from '../../src/api/shelf-provider';
import { canRenderContent, describeLoad } from '../../src/api/load-state';
import { SHELF_KINDS } from '../../src/api/shelf';
import { useSession } from '../../src/session';

export default function Profile() {
  const {
    data,
    loading: meLoading,
    error: meError,
    hasLoaded: meHasLoaded,
    reload: reloadMe,
  } = useMeShared();
  const shelf = useShelf();
  const { byKind } = shelf;
  const { signOut } = useSession();
  const router = useRouter();

  const view = describeLoad({
    loading: meLoading,
    error: meError,
    hasLoaded: meHasLoaded,
  });
  const shelfView = describeLoad({
    loading: shelf.loading,
    error: shelf.error,
    hasLoaded: shelf.hasLoaded,
  });
  // An unreachable shelf is not an empty shelf. Counts stay unknown until we
  // have actually heard back.
  const shelfKnown = canRenderContent(shelfView);

  if (view === 'first-load') {
    return (
      <CosmicScreen>
        <LoadPlaceholder label="Loading your profile" />
      </CosmicScreen>
    );
  }

  if (view === 'failed') {
    return (
      <CosmicScreen>
        <LoadFailure error={meError} onRetry={() => void reloadMe()} busy={meLoading} />
      </CosmicScreen>
    );
  }

  const archetype = data?.user?.archetype ?? null;
  const name = data?.user?.name?.trim() || 'Your profile';
  const initial = name === 'Your profile' ? 'M' : name.charAt(0).toUpperCase();
  const streak = data?.streak ?? 0;
  const entries = data?.entries ?? [];
  const match = data?.match ?? null;
  const filledKinds = SHELF_KINDS.filter((kind) => byKind[kind]);

  return (
    <CosmicScreen contentStyle={styles.immersiveContent}>
      <InnerUniverseScene
        name={name}
        initial={initial}
        archetype={archetype}
        entries={entries}
        userId={data?.user?.id ?? 0}
        filledKinds={filledKinds}
        currentNight={match?.day ?? null}
      />

      <View style={styles.sheet}>
        <Text style={styles.sheetLabel}>YOUR PRIVATE RECORD</Text>

        {view === 'stale' ? (
          <StaleNotice error={meError} onRetry={() => void reloadMe()} busy={meLoading} />
        ) : null}
        <View style={styles.stats}>
          <Stat value={String(entries.length)} label="sealed nights" />
          <View style={styles.statRule} />
          <Stat
            value={shelfKnown ? `${filledKinds.length}/5` : '—'}
            label="shelf objects"
          />
          <View style={styles.statRule} />
          <Stat value={String(streak)} label="night streak" />
        </View>

        {!archetype ? (
          <ActionRow
            eyebrow="PROFILE FOUNDATION"
            title="Explore your connection pattern"
            detail="Eleven reflective, non-diagnostic questions"
            onPress={() => router.push('/scan')}
            highlighted
          />
        ) : null}

        {shelfKnown ? (
          <ShelfStrip byKind={byKind} title="Objects in your orbit" />
        ) : shelfView === 'failed' ? (
          <LoadFailure
            error={shelf.error}
            onRetry={() => void shelf.reload()}
            busy={shelf.loading}
          />
        ) : (
          <LoadPlaceholder label="Loading your taste objects" />
        )}

        {match ? (
          <>
            <SectionHeader title="Your current room" />
            <ActionRow
              eyebrow={`NIGHT ${String(match.day).padStart(2, '0')} OF 21`}
              title="Continue tonight’s ritual"
              detail="Your writing remains private until the scheduled reveal"
              onPress={() => router.push('/rooms')}
            />
          </>
        ) : null}

        <SectionHeader title="Control your account" />
        <ActionRow
          eyebrow="SAFETY"
          title="Safety & privacy"
          detail="Connections, reports, export, and deletion"
          onPress={() => router.push('/safety-privacy' as Href)}
        />
        <ActionRow
          eyebrow="ATTENTION"
          title="Notification rhythm"
          detail="Choose which reminders may reach you"
          onPress={() => router.push('/notification-settings' as Href)}
        />

        <Pressable
          onPress={signOut}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
          style={({ pressed }) => [styles.signOut, pressed && styles.pressed]}
        >
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </View>
    </CosmicScreen>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function ActionRow({
  eyebrow,
  title,
  detail,
  onPress,
  highlighted = false,
}: {
  eyebrow: string;
  title: string;
  detail: string;
  onPress: () => void;
  highlighted?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => [
        styles.row,
        highlighted && styles.rowHighlighted,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.rowCopy}>
        <Text style={[styles.rowEyebrow, highlighted && styles.rowEyebrowHighlighted]}>
          {eyebrow}
        </Text>
        <Text style={[styles.rowTitle, highlighted && styles.rowTitleHighlighted]}>
          {title}
        </Text>
        <Text style={[styles.rowDetail, highlighted && styles.rowDetailHighlighted]}>
          {detail}
        </Text>
      </View>
      <Text style={[styles.chevron, highlighted && styles.chevronHighlighted]}>→</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  immersiveContent: { paddingHorizontal: 0, paddingBottom: 0 },
  sheet: {
    minHeight: 620,
    marginTop: -24,
    paddingHorizontal: space.lg,
    paddingTop: space.xl,
    paddingBottom: space.huge,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: brand.card,
    borderTopWidth: 1,
    borderColor: brand.line,
  },
  sheetLabel: {
    ...type.eyebrow,
    color: brand.rose,
    fontSize: 8.5,
    letterSpacing: 1.25,
  },
  stats: {
    minHeight: 92,
    marginTop: space.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: brand.line,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { ...type.bodyStrong, color: brand.ink, fontSize: 18 },
  statLabel: {
    ...type.bodySmall,
    color: brand.inkLow,
    fontSize: 9.5,
    marginTop: 3,
  },
  statRule: { height: 34, width: 1, backgroundColor: brand.line },
  sectionHeader: {
    marginTop: space.xl,
    marginBottom: space.sm,
    paddingBottom: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: brand.line,
  },
  sectionTitle: {
    ...type.bodyStrong,
    color: brand.ink,
    fontSize: 17,
  },
  row: {
    minHeight: 92,
    paddingHorizontal: space.md,
    borderBottomWidth: 1,
    borderBottomColor: brand.line,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowHighlighted: {
    marginTop: space.lg,
    borderRadius: radius.md,
    borderBottomWidth: 0,
    backgroundColor: brand.rose,
  },
  rowCopy: { flex: 1, paddingVertical: space.md },
  rowEyebrow: {
    ...type.eyebrow,
    color: brand.rose,
    fontSize: 7.5,
    letterSpacing: 0.9,
  },
  rowEyebrowHighlighted: { color: 'rgba(8,5,15,0.58)' },
  rowTitle: {
    ...type.bodyStrong,
    color: brand.ink,
    fontSize: 14.5,
    marginTop: 3,
  },
  rowTitleHighlighted: { color: brand.void },
  rowDetail: {
    ...type.bodySmall,
    color: brand.inkLow,
    fontSize: 10.5,
    marginTop: 2,
  },
  rowDetailHighlighted: { color: 'rgba(8,5,15,0.68)' },
  chevron: { color: brand.gold, fontSize: 19, marginLeft: space.md },
  chevronHighlighted: { color: brand.void },
  signOut: {
    minHeight: 52,
    marginTop: space.xl,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: brand.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: { ...type.bodyStrong, color: brand.rose },
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
});
