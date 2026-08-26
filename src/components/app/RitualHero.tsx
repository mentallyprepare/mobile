import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import OrbitTrack from './OrbitTrack';
import { brand, radius, space, type } from '../../design';
import { arcLabel } from '../../arc';
import { ritualPhaseTheme } from '../../ritualPhase';

export default function RitualHero({
  night,
  prompt,
  sealed = false,
  presence,
  actionLabel,
  onPress,
}: {
  night: number;
  prompt: string;
  sealed?: boolean;
  presence: string;
  actionLabel?: string;
  onPress?: () => void;
}) {
  const phase = ritualPhaseTheme(night);

  return (
    <LinearGradient colors={phase.background} style={styles.hero}>
      <View pointerEvents="none" style={styles.orb} />
      <View pointerEvents="none" style={styles.halo} />
      <View pointerEvents="none" style={styles.glow} />

      <View style={styles.topline}>
        <View>
          <Text style={styles.phase}>NIGHT {String(night).padStart(2, '0')} / 21</Text>
          <Text style={styles.phaseName}>{phase.label}</Text>
        </View>
        <Text style={styles.arc}>{arcLabel(night).toUpperCase()}</Text>
      </View>

      <View style={styles.phaseRail}>
        {[0, 1, 2].map((part) => (
          <View
            key={part}
            style={[
              styles.phaseSegment,
              part === Math.min(2, Math.floor((night - 1) / 7)) && {
                backgroundColor: phase.current,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.orbit}>
        <OrbitTrack
          current={night}
          size={204}
          activeColor={phase.active}
          currentColor={phase.current}
        />
      </View>

      <Text style={styles.state}>{sealed ? 'NOTE SEALED' : 'TONIGHT’S PROMPT'}</Text>
      <Text style={styles.prompt}>
        {sealed ? 'Your part is done. Let the night hold it.' : prompt}
      </Text>

      <View style={styles.presenceRow}>
        <View style={[styles.presenceDot, { backgroundColor: phase.current }]} />
        <Text style={styles.presence}>{presence}</Text>
      </View>

      {actionLabel && onPress ? (
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
        >
          <Text style={styles.actionLabel}>{actionLabel}</Text>
          <Text style={styles.actionArrow}>→</Text>
        </Pressable>
      ) : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginTop: space.xl,
    minHeight: 540,
    borderRadius: radius.xl,
    padding: space.xl,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  orb: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    top: 74,
    right: -58,
    backgroundColor: 'rgba(248,242,255,0.075)',
  },
  halo: {
    position: 'absolute',
    width: 330,
    height: 82,
    borderRadius: 165,
    borderWidth: 1,
    borderColor: 'rgba(248,242,255,0.18)',
    top: 158,
    right: -100,
    transform: [{ rotate: '-14deg' }],
  },
  glow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    top: 140,
    left: -72,
    backgroundColor: 'rgba(236,200,133,0.14)',
  },
  topline: {
    position: 'absolute',
    top: space.xl,
    left: space.xl,
    right: space.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  phase: {
    ...type.eyebrow,
    color: 'rgba(248,242,255,0.78)',
    fontSize: 8.5,
    letterSpacing: 1.4,
  },
  phaseName: {
    ...type.display,
    color: brand.ink,
    fontSize: 25,
    lineHeight: 29,
    marginTop: 2,
  },
  arc: {
    ...type.eyebrow,
    color: 'rgba(248,242,255,0.56)',
    fontSize: 7.5,
    maxWidth: 90,
    textAlign: 'right',
  },
  phaseRail: {
    position: 'absolute',
    top: 92,
    left: space.xl,
    right: space.xl,
    flexDirection: 'row',
    gap: 5,
  },
  phaseSegment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(248,242,255,0.18)',
  },
  orbit: { alignItems: 'center', marginBottom: -2 },
  state: {
    ...type.eyebrow,
    color: 'rgba(248,242,255,0.68)',
    fontSize: 8.5,
    letterSpacing: 1.2,
  },
  prompt: {
    ...type.display,
    color: brand.ink,
    fontSize: 33,
    lineHeight: 37,
    marginTop: space.sm,
  },
  presenceRow: { flexDirection: 'row', alignItems: 'center', marginTop: space.lg },
  presenceDot: { width: 7, height: 7, borderRadius: 4 },
  presence: {
    ...type.bodySmall,
    color: 'rgba(248,242,255,0.7)',
    marginLeft: space.sm,
    flex: 1,
  },
  action: {
    minHeight: 54,
    marginTop: space.lg,
    borderRadius: radius.md,
    backgroundColor: brand.rose,
    paddingHorizontal: space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionLabel: { ...type.bodyStrong, color: brand.void, fontSize: 15 },
  actionArrow: { color: brand.void, fontSize: 19 },
  pressed: { opacity: 0.78 },
});
