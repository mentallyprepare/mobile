import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import CosmicScreen from '../../src/components/app/CosmicScreen';
import LivingNightScene from '../../src/components/ritual/LivingNightScene';
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

export default function Home() {
  const { data, loading, error, hasLoaded, reload } = useMeShared();
  const shelf = useShelf();
  const { byKind } = shelf;
  const router = useRouter();

  const view = describeLoad({ loading, error, hasLoaded });
  const shelfView = describeLoad({
    loading: shelf.loading,
    error: shelf.error,
    hasLoaded: shelf.hasLoaded,
  });
  // A shelf we could not fetch is not a shelf with nothing on it. Until we
  // know, counts read as unknown rather than zero.
  const shelfKnown = canRenderContent(shelfView);

  if (view === 'first-load') {
    return (
      <CosmicScreen>
        <LoadPlaceholder label="Loading your world" />
      </CosmicScreen>
    );
  }

  if (view === 'failed') {
    return (
      <CosmicScreen>
        <LoadFailure error={error} onRetry={() => void reload()} busy={loading} />
      </CosmicScreen>
    );
  }

  const archetype = data?.user?.archetype ?? null;
  const match = data?.match ?? null;
  const fullName = data?.user?.name?.trim() || null;
  const name = fullName?.split(/\s+/)[0] || null;
  const initial = fullName?.charAt(0).toUpperCase() || 'M';
  const shelfCount = Object.values(byKind).filter(Boolean).length;
  const streak = data?.streak ?? 0;

  const staleBanner =
    view === 'stale' ? (
      <StaleNotice error={error} onRetry={() => void reload()} busy={loading} />
    ) : null;

  const shelfSection =
    shelfKnown ? (
      <ShelfStrip byKind={byKind} title="Your cultural shelf" />
    ) : shelfView === 'failed' ? (
      <LoadFailure
        error={shelf.error}
        onRetry={() => void shelf.reload()}
        busy={shelf.loading}
      />
    ) : (
      <LoadPlaceholder label="Loading your shelf" />
    );

  if (match) {
    const partnerPresent = data?.partnerStatus?.partnerHasWrittenToday ?? false;
    const sealedTonight = !!data?.entries?.some((entry) => entry.day === match.day);

    return (
      <CosmicScreen contentStyle={styles.immersiveContent}>
        <View style={styles.padded}>
          <AppHeader
            name={name}
            initial={initial}
            onNotifications={() => router.push('/notification-settings')}
          />
          {staleBanner}
        </View>

        <LivingNightScene
          night={match.day}
          prompt={match.currentPrompt}
          entries={data?.entries ?? []}
          userId={data?.user?.id ?? 0}
          sealed={sealedTonight}
          partnerPresent={partnerPresent}
          compact
          actionLabel={sealedTonight ? 'Open tonight’s room' : 'Write tonight’s note'}
          onPress={() => router.push('/rooms')}
        />

        <View style={styles.padded}>
          <View style={styles.metrics}>
            <Metric value={String(streak)} label="NIGHT STREAK" />
            <View style={styles.metricDivider} />
            <Metric value={shelfKnown ? `${shelfCount}/5` : '—'} label="SHELF FILLED" />
            <View style={styles.metricDivider} />
            <Metric value={String(data?.entries?.length ?? 0)} label="NOTES SEALED" />
          </View>

          {shelfSection}
        </View>
      </CosmicScreen>
    );
  }

  const setupDone = Number(!!archetype) + Number(shelfKnown && shelfCount > 0);
  const setupPercent = setupDone * 50;

  return (
    <CosmicScreen>
      <AppHeader name={name} initial={initial} onNotifications={() => router.push('/notification-settings')} />

      {staleBanner}

      <View style={styles.setup}>
        <View style={styles.setupTopline}>
          <View>
            <Text style={styles.kicker}>PRIVATE PROFILE</Text>
            <Text style={styles.setupTitle}>Set up your world</Text>
          </View>
          <View style={styles.percentBadge}>
            <Text style={styles.percent}>{shelfKnown ? `${setupPercent}%` : '—'}</Text>
          </View>
        </View>

        <View style={styles.progress}>
          <View
            style={[
              styles.progressPart,
              archetype && styles.progressPartComplete,
            ]}
          />
          <View
            style={[
              styles.progressPart,
              shelfKnown && shelfCount > 0 && styles.progressPartComplete,
            ]}
          />
        </View>

        <Pressable
          onPress={() => router.push('/scan')}
          accessibilityRole="button"
          accessibilityLabel={archetype ? 'Review your connection pattern' : 'Take the connection scan'}
          style={({ pressed }) => [styles.primaryTask, pressed && styles.pressed]}
        >
          <View style={styles.taskNumber}>
            <Text style={styles.taskNumberText}>01</Text>
          </View>
          <View style={styles.taskCopy}>
            <Text style={styles.taskLabel}>CONNECTION PATTERN</Text>
            <Text style={styles.taskTitle}>{archetype || 'Take the 11-question scan'}</Text>
            <Text style={styles.taskDetail}>
              {archetype ? 'Your reflective result is ready' : 'Private, reflective, non-diagnostic'}
            </Text>
          </View>
          <Text style={styles.taskArrow}>→</Text>
        </Pressable>

        <View style={styles.tileRow}>
          <Pressable
            onPress={() => router.push('/create')}
            accessibilityRole="button"
            accessibilityLabel="Open your cultural shelf"
            style={({ pressed }) => [styles.tile, styles.shelfTile, pressed && styles.pressed]}
          >
            <Text style={[styles.tileIndex, styles.shelfTileText]}>02</Text>
            <View>
              <Text style={[styles.tileLabel, styles.shelfTileText]}>YOUR SHELF</Text>
              <Text style={[styles.tileValue, styles.shelfTileText]}>{shelfCount} / 5</Text>
              <Text style={[styles.tileDetail, styles.shelfTileText]}>
                songs · film · book · memory
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => router.push('/notification-settings')}
            accessibilityRole="button"
            accessibilityLabel="Open notification settings"
            style={({ pressed }) => [styles.tile, styles.reminderTile, pressed && styles.pressed]}
          >
            <Text style={styles.tileIndex}>03</Text>
            <View>
              <Text style={styles.tileLabel}>REMINDERS</Text>
              <Text style={styles.tileValue}>Quiet</Text>
              <Text style={styles.tileDetail}>optional · private · controlled</Text>
            </View>
          </Pressable>
        </View>
      </View>

      {shelfSection}

      <View style={styles.ritualSection}>
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionTitle}>The 21-night ritual</Text>
          <Text style={styles.sectionMeta}>PRIVATE BY DESIGN</Text>
        </View>
        <View style={styles.nightRail}>
          {Array.from({ length: 21 }, (_, index) => (
            <View
              key={index}
              style={[
                styles.nightDot,
                index === 0 && styles.nightDotStart,
                index === 20 && styles.nightDotEnd,
              ]}
            />
          ))}
        </View>
        <View style={styles.ritualSteps}>
          <RitualStep number="01" title="Meet through meaning" />
          <RitualStep number="07" title="Build private rhythm" />
          <RitualStep number="21" title="Reveal with consent" />
        </View>
      </View>
    </CosmicScreen>
  );
}

function AppHeader({
  name,
  initial,
  onNotifications,
}: {
  name: string | null;
  initial: string;
  onNotifications: () => void;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.identity}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{initial}</Text></View>
        <View>
          <Text style={styles.greeting}>Good evening</Text>
          <Text style={styles.name}>{name || 'Your private world'}</Text>
        </View>
      </View>
      <Pressable
        onPress={onNotifications}
        accessibilityRole="button"
        accessibilityLabel="Notification settings"
        style={({ pressed }) => [styles.bell, pressed && styles.pressed]}
      >
        <View style={styles.bellTop} />
        <View style={styles.bellBody} />
        <View style={styles.bellDot} />
      </Pressable>
    </View>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function RitualStep({ number, title }: { number: string; title: string }) {
  return (
    <View style={styles.ritualStep}>
      <Text style={styles.ritualNumber}>{number}</Text>
      <Text style={styles.ritualTitle}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  immersiveContent: { paddingHorizontal: 0 },
  padded: { paddingHorizontal: space.lg },
  header: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  identity: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: brand.rose,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: space.md,
  },
  avatarText: { ...type.bodyStrong, color: brand.void, fontSize: 17 },
  greeting: { ...type.bodySmall, color: brand.inkMid, fontSize: 10.5 },
  name: { ...type.bodyStrong, color: brand.ink, fontSize: 16, marginTop: -1 },
  bell: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: brand.line,
    backgroundColor: brand.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellTop: {
    width: 6,
    height: 3,
    borderRadius: 3,
    backgroundColor: brand.inkMid,
    marginBottom: -1,
  },
  bellBody: {
    width: 15,
    height: 15,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    borderWidth: 1.5,
    borderColor: brand.inkMid,
  },
  bellDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: brand.rose,
    marginTop: 2,
  },
  setup: {
    marginTop: space.lg,
    padding: space.lg,
    borderRadius: radius.lg,
    backgroundColor: brand.card,
    borderWidth: 1,
    borderColor: brand.line,
  },
  setupTopline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kicker: { ...type.eyebrow, color: brand.rose, fontSize: 8, letterSpacing: 1.2 },
  setupTitle: { ...type.bodyStrong, color: brand.ink, fontSize: 22, marginTop: 2 },
  percentBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 5,
    borderColor: 'rgba(137,108,181,0.46)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percent: { ...type.bodyStrong, color: brand.ink, fontSize: 11 },
  progress: { flexDirection: 'row', gap: 6, marginTop: space.lg },
  progressPart: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: brand.line,
  },
  progressPartComplete: { backgroundColor: brand.rose },
  primaryTask: {
    minHeight: 108,
    marginTop: space.lg,
    padding: space.lg,
    borderRadius: radius.md,
    backgroundColor: brand.rose,
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskNumber: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: 'rgba(8,5,15,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskNumberText: { ...type.bodyStrong, color: brand.void, fontSize: 12 },
  taskCopy: { flex: 1, marginLeft: space.md },
  taskLabel: {
    ...type.eyebrow,
    color: brand.void,
    fontSize: 7.5,
    letterSpacing: 1,
  },
  taskTitle: { ...type.bodyStrong, color: brand.void, fontSize: 16, marginTop: 2 },
  taskDetail: { ...type.bodySmall, color: brand.void, fontSize: 10.5 },
  taskArrow: { color: brand.void, fontSize: 21 },
  tileRow: { flexDirection: 'row', gap: space.md, marginTop: space.md },
  tile: {
    flex: 1,
    minHeight: 154,
    borderRadius: radius.md,
    padding: space.lg,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  shelfTile: { backgroundColor: brand.purple },
  shelfTileText: { color: brand.void },
  reminderTile: {
    backgroundColor: brand.card,
    borderWidth: 1,
    borderColor: brand.gold,
  },
  tileIndex: { ...type.bodyStrong, color: brand.inkMid, fontSize: 11 },
  tileLabel: {
    ...type.eyebrow,
    color: brand.inkMid,
    fontSize: 7.5,
    letterSpacing: 0.9,
  },
  tileValue: { ...type.bodyStrong, color: brand.ink, fontSize: 22, marginTop: 1 },
  tileDetail: {
    ...type.bodySmall,
    color: brand.inkMid,
    fontSize: 9.5,
    lineHeight: 14,
    marginTop: 3,
  },
  metrics: {
    minHeight: 88,
    marginTop: space.md,
    borderRadius: radius.md,
    backgroundColor: brand.card,
    flexDirection: 'row',
    alignItems: 'center',
  },
  metric: { flex: 1, alignItems: 'center' },
  metricValue: { ...type.bodyStrong, color: brand.ink, fontSize: 18 },
  metricLabel: {
    ...type.eyebrow,
    color: brand.inkLow,
    fontSize: 7,
    letterSpacing: 0.7,
    marginTop: 3,
  },
  metricDivider: { width: 1, height: 36, backgroundColor: brand.line },
  ritualSection: {
    marginTop: space.xl,
    padding: space.lg,
    borderRadius: radius.lg,
    backgroundColor: brand.card,
    borderWidth: 1,
    borderColor: brand.line,
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  sectionTitle: { ...type.bodyStrong, color: brand.ink, fontSize: 17 },
  sectionMeta: {
    ...type.eyebrow,
    color: brand.inkLow,
    fontSize: 7,
    letterSpacing: 0.8,
  },
  nightRail: {
    marginTop: space.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nightDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: brand.inkFaint,
  },
  nightDotStart: { width: 9, height: 9, borderRadius: 5, backgroundColor: brand.rose },
  nightDotEnd: { width: 9, height: 9, borderRadius: 5, backgroundColor: brand.gold },
  ritualSteps: { flexDirection: 'row', gap: space.md, marginTop: space.xl },
  ritualStep: { flex: 1 },
  ritualNumber: { ...type.bodyStrong, color: brand.rose, fontSize: 11 },
  ritualTitle: { ...type.bodySmall, color: brand.inkMid, fontSize: 10, lineHeight: 14, marginTop: 2 },
  pressed: { opacity: 0.76, transform: [{ scale: 0.99 }] },
});
