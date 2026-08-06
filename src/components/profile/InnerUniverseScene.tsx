import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  Polyline,
  RadialGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import type { MeEntry } from '../../api/me';
import { SHELF_KINDS, type ShelfKind } from '../../api/shelf';
import { brand, space, type } from '../../design';
import { ritualPhaseTheme } from '../../ritualPhase';
import { starPositions } from '../../sky';

const MAP_WIDTH = 360;
const MAP_HEIGHT = 310;

const FIELD_STARS = [
  [20, 32, 1], [47, 86, 0.7], [76, 25, 1.2], [105, 111, 0.8],
  [135, 43, 0.7], [161, 88, 1], [201, 27, 0.8], [232, 77, 1.2],
  [264, 38, 0.7], [298, 99, 1], [331, 28, 0.8], [343, 145, 1.1],
  [28, 178, 0.7], [73, 151, 1], [284, 169, 0.8], [323, 211, 0.7],
] as const;

const SHELF_NODES: Record<ShelfKind, { x: number; y: number; code: string }> = {
  song_a: { x: 46, y: 235, code: 'S1' },
  song_b: { x: 105, y: 272, code: 'S2' },
  film: { x: 180, y: 286, code: 'F' },
  book: { x: 255, y: 272, code: 'B' },
  memory: { x: 314, y: 235, code: 'M' },
};

function UniverseArtwork({
  entries,
  userId,
  filledKinds,
  initial,
  currentNight,
}: {
  entries: MeEntry[];
  userId: number;
  filledKinds: ShelfKind[];
  initial: string;
  currentNight: number | null;
}) {
  const entryStars = starPositions(entries, userId, {
    width: 320,
    height: 150,
    pad: 22,
  }).map((point) => ({ ...point, x: point.x + 20, y: point.y + 35 }));
  const trail = entryStars.map((point) => `${point.x},${point.y}`).join(' ');
  const completed = new Set(filledKinds);

  return (
    <Svg
      width="100%"
      height={MAP_HEIGHT}
      viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
      accessibilityRole="image"
      accessibilityLabel={`${entries.length} sealed nights and ${filledKinds.length} shelf objects form your private universe`}
    >
      <Defs>
        <RadialGradient id="identityCore" cx="38%" cy="30%" rx="68%" ry="68%">
          <Stop offset="0%" stopColor={brand.ink} stopOpacity="0.94" />
          <Stop offset="20%" stopColor={brand.rose} stopOpacity="0.94" />
          <Stop offset="68%" stopColor={brand.purple} stopOpacity="0.96" />
          <Stop offset="100%" stopColor={brand.sky} stopOpacity="1" />
        </RadialGradient>
        <RadialGradient id="identityGlow" cx="50%" cy="50%" rx="50%" ry="50%">
          <Stop offset="0%" stopColor={brand.rose} stopOpacity="0.3" />
          <Stop offset="100%" stopColor={brand.purple} stopOpacity="0" />
        </RadialGradient>
      </Defs>

      {FIELD_STARS.map(([x, y, radius], index) => (
        <Circle
          key={`field-${index}`}
          cx={x}
          cy={y}
          r={radius}
          fill={brand.ink}
          opacity={index % 3 === 0 ? 0.68 : 0.32}
        />
      ))}

      <Ellipse
        cx="180"
        cy="157"
        rx="128"
        ry="50"
        fill="none"
        stroke={brand.ink}
        strokeOpacity="0.12"
        strokeWidth="1"
        strokeDasharray="3 7"
      />

      {trail ? (
        <Polyline
          points={trail}
          fill="none"
          stroke={brand.rose}
          strokeOpacity="0.3"
          strokeWidth="1"
        />
      ) : null}
      {entryStars.map((point, index) => (
        <Circle
          key={`entry-${point.day}-${index}`}
          cx={point.x}
          cy={point.y}
          r={point.day === currentNight ? 4.6 : 2.7}
          fill={point.day === currentNight ? brand.gold : brand.ink}
          opacity={point.day === currentNight ? 1 : 0.76}
        />
      ))}

      <Circle cx="180" cy="155" r="78" fill="url(#identityGlow)" />
      <Circle
        cx="180"
        cy="155"
        r="52"
        fill="url(#identityCore)"
        stroke={brand.ink}
        strokeOpacity="0.18"
      />
      <Ellipse
        cx="180"
        cy="155"
        rx="72"
        ry="25"
        fill="none"
        stroke={brand.gold}
        strokeOpacity="0.72"
        strokeWidth="2"
        transform="rotate(-12 180 155)"
      />
      <Circle cx="243" cy="140" r="5" fill={brand.gold} />
      <SvgText
        x="180"
        y="165"
        fill={brand.void}
        fontFamily="Manrope"
        fontSize="28"
        fontWeight="700"
        textAnchor="middle"
      >
        {initial}
      </SvgText>

      {SHELF_KINDS.map((kind) => {
        const node = SHELF_NODES[kind];
        const active = completed.has(kind);
        return (
          <G key={kind}>
            {active ? (
              <Line
                x1="180"
                y1="207"
                x2={node.x}
                y2={node.y}
                stroke={brand.rose}
                strokeOpacity="0.22"
                strokeWidth="1"
              />
            ) : null}
            <Circle
              cx={node.x}
              cy={node.y}
              r={active ? 16 : 12}
              fill={active ? brand.card : brand.sky}
              stroke={active ? brand.rose : brand.ink}
              strokeOpacity={active ? 0.86 : 0.16}
              strokeWidth={active ? 2 : 1}
            />
            <SvgText
              x={node.x}
              y={node.y + 3}
              fill={active ? brand.ink : brand.inkLow}
              fontFamily="Manrope"
              fontSize="8"
              fontWeight="700"
              textAnchor="middle"
            >
              {node.code}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}

export default function InnerUniverseScene({
  name,
  initial,
  archetype,
  entries,
  userId,
  filledKinds,
  currentNight,
}: {
  name: string;
  initial: string;
  archetype: string | null;
  entries: MeEntry[];
  userId: number;
  filledKinds: ShelfKind[];
  currentNight: number | null;
}) {
  const phase = ritualPhaseTheme(currentNight ?? 1);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [pulse] = useState(() => new Animated.Value(0));

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (mounted) setReduceMotion(value);
    });
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      pulse.setValue(0.4);
      return;
    }
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse, reduceMotion]);

  const stateLabel = useMemo(() => {
    if (currentNight) return `NIGHT ${String(currentNight).padStart(2, '0')} · ${phase.label.toUpperCase()}`;
    return 'PRIVATE PROFILE · NO ACTIVE ROOM';
  }, [currentNight, phase.label]);

  return (
    <LinearGradient colors={phase.background} locations={[0, 1]} style={styles.scene}>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>YOUR INNER UNIVERSE</Text>
          <Text style={styles.name}>{name}</Text>
        </View>
        <View style={styles.privateBadge}>
          <View style={styles.privateDot} />
          <Text style={styles.privateText}>PRIVATE</Text>
        </View>
      </View>

      <View style={styles.artwork}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.pulse,
            {
              opacity: pulse.interpolate({
                inputRange: [0, 1],
                outputRange: [0.12, 0.34],
              }),
              transform: [
                {
                  scale: pulse.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.88, 1.12],
                  }),
                },
              ],
            },
          ]}
        />
        <UniverseArtwork
          entries={entries}
          userId={userId}
          filledKinds={filledKinds}
          initial={initial}
          currentNight={currentNight}
        />
      </View>

      <View style={styles.summary}>
        <Text style={styles.stateLabel}>{stateLabel}</Text>
        <Text style={styles.patternLabel}>CONNECTION PATTERN</Text>
        <Text style={styles.pattern}>{archetype || 'Not explored yet'}</Text>
        <Text style={styles.explainer}>
          Sealed nights become stars. Shelf objects stay in orbit. This is a record of what
          you chose—not a prediction about who you are.
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scene: {
    minHeight: 690,
    overflow: 'hidden',
    paddingHorizontal: space.lg,
    paddingTop: space.xl,
    paddingBottom: 46,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  kicker: {
    ...type.eyebrow,
    color: brand.rose,
    fontSize: 8.5,
    letterSpacing: 1.25,
  },
  name: {
    ...type.bodyStrong,
    color: brand.ink,
    fontSize: 27,
    marginTop: 4,
  },
  privateBadge: {
    minHeight: 28,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: brand.line,
    backgroundColor: 'rgba(8,5,15,0.32)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  privateDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
    backgroundColor: brand.gold,
  },
  privateText: {
    ...type.eyebrow,
    color: brand.inkMid,
    fontSize: 7,
    letterSpacing: 0.8,
  },
  artwork: {
    height: MAP_HEIGHT,
    marginHorizontal: -space.lg,
    marginTop: space.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
    top: 82,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: brand.rose,
  },
  summary: {
    marginTop: space.md,
    paddingTop: space.lg,
    borderTopWidth: 1,
    borderTopColor: brand.line,
  },
  stateLabel: {
    ...type.eyebrow,
    color: brand.gold,
    fontSize: 8,
    letterSpacing: 1,
  },
  patternLabel: {
    ...type.eyebrow,
    color: brand.inkLow,
    fontSize: 8,
    letterSpacing: 1,
    marginTop: space.lg,
  },
  pattern: {
    ...type.display,
    color: brand.ink,
    fontSize: 32,
    lineHeight: 38,
    marginTop: 3,
  },
  explainer: {
    ...type.bodySmall,
    color: brand.inkMid,
    fontSize: 11.5,
    lineHeight: 18,
    marginTop: space.sm,
    maxWidth: 380,
  },
});
