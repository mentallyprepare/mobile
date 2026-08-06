import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import CosmicScreen from '../../src/components/app/CosmicScreen';
import ShelfCover from '../../src/components/shelf/ShelfCover';
import {
  LoadFailure,
  LoadPlaceholder,
  StaleNotice,
} from '../../src/components/app/LoadFailure';
import { brand, space, type } from '../../src/design';
import { useShelf } from '../../src/api/shelf-provider';
import { describeLoad } from '../../src/api/load-state';
import { SHELF_KINDS } from '../../src/api/shelf';

export default function Shelf() {
  const { byKind, loading, error, hasLoaded, reload } = useShelf();
  const router = useRouter();
  const filledCount = Object.values(byKind).filter(Boolean).length;
  const view = describeLoad({ loading, error, hasLoaded });

  return (
    <CosmicScreen>
      <Text style={styles.screenLabel}>INNER SHELF</Text>
      <Text style={styles.title}>Things that carry you</Text>
      <Text style={styles.subtitle}>
        Keep a private record of the music and memories that matter to you.
      </Text>

      {view === 'first-load' ? (
        <LoadPlaceholder label="Loading your shelf" />
      ) : view === 'failed' ? (
        <LoadFailure error={error} onRetry={() => void reload()} busy={loading} />
      ) : (
        <>
          {view === 'stale' ? (
            <StaleNotice error={error} onRetry={() => void reload()} busy={loading} />
          ) : null}

          <View style={styles.progressBlock}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressCount}>{filledCount} of 5 chosen</Text>
              <Text style={styles.progressLabel}>private to your account</Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(filledCount / SHELF_KINDS.length) * 100}%` },
                ]}
              />
            </View>
          </View>

          <View style={styles.grid}>
            {SHELF_KINDS.map((kind, index) => {
              const wide = kind === 'memory';
              return (
                <ShelfCover
                  key={kind}
                  kind={kind}
                  item={byKind[kind]}
                  available
                  index={index + 1}
                  wide={wide}
                  style={wide ? styles.wide : styles.tile}
                  onPress={() =>
                    router.push({ pathname: '/shelf/[kind]', params: { kind } })
                  }
                />
              );
            })}
          </View>

          <Text style={styles.note}>
            Add a title manually. Catalogue search and public activity are not required.
          </Text>
        </>
      )}
    </CosmicScreen>
  );
}

const styles = StyleSheet.create({
  screenLabel: {
    ...type.eyebrow,
    color: brand.rose,
    fontSize: 9,
    letterSpacing: 1.4,
  },
  title: {
    ...type.bodyStrong,
    color: brand.ink,
    fontSize: 30,
    lineHeight: 36,
    marginTop: space.sm,
  },
  subtitle: { ...type.body, color: brand.inkMid, marginTop: 3, maxWidth: 350 },
  progressBlock: {
    marginTop: space.xl,
    paddingVertical: space.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: brand.line,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  progressCount: { ...type.bodyStrong, color: brand.ink, fontSize: 15 },
  progressLabel: { ...type.bodySmall, color: brand.inkLow, fontSize: 10 },
  progressTrack: {
    height: 3,
    marginTop: space.md,
    borderRadius: 2,
    backgroundColor: brand.line,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: brand.rose },
  grid: {
    marginTop: space.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: space.md,
  },
  tile: { width: '48%', height: 206 },
  wide: { width: '100%' },
  note: {
    ...type.bodySmall,
    color: brand.inkLow,
    lineHeight: 18,
    marginTop: space.lg,
  },
});
