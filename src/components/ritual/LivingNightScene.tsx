import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  LinearGradient as SvgLinearGradient,
  Path,
  Polyline,
  RadialGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import { brand, space, type } from '../../design';
import { ritualPhaseTheme } from '../../ritualPhase';
import { starPositions, type SkyEntry } from '../../sky';

const TOTAL_NIGHTS = 21;
const MAP_WIDTH = 340;
const MAP_HEIGHT = 228;

const BACKGROUND_STARS = [
  [18, 31, 1.2], [44, 74, 0.8], [67, 25, 1.4], [91, 123, 0.9],
  [118, 48, 0.7], [136, 191, 1.1], [164, 34, 0.8], [192, 74, 1.3],
  [218, 22, 0.7], [245, 128, 1], [271, 56, 1.2], [294, 181, 0.8],
  [319, 93, 1.1], [327, 29, 0.7], [34, 186, 0.8], [74, 211, 1],
] as const;

function orbitNodes(night: number) {
  return Array.from({ length: TOTAL_NIGHTS }, (_, index) => {
    const angle = -Math.PI / 2 + (index / TOTAL_NIGHTS) * Math.PI * 2;
    return {
      x: 170 + Math.cos(angle) * 82,
      y: 113 + Math.sin(angle) * 29,
      active: index < night,
      current: index === Math.max(0, night - 1),
    };
  });
}

function SkyArtwork({
  night,
  entries,
  userId,
  inactive,
}: {
  night: number;
  entries: SkyEntry[];
  userId: number;
  inactive: boolean;
}) {
  const phase = ritualPhaseTheme(Math.max(1, night));
  const points = starPositions(entries, userId, {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    pad: 24,
  });
  const trail = points.map((point) => `${point.x},${point.y}`).join(' ');
  const nodes = orbitNodes(night);

  return (
    <Svg
      width="100%"
      height={MAP_HEIGHT}
      viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
      accessibilityRole="image"
      accessibilityLabel={
        inactive
          ? 'The twenty-one-night room, waiting to begin'
          : `Night ${night} of twenty-one with ${entries.length} sealed notes`
      }
    >
      <Defs>
        <RadialGradient id="nightCore" cx="40%" cy="32%" rx="64%" ry="64%">
          <Stop offset="0" stopColor={brand.ink} stopOpacity="0.44" />
          <Stop offset="0.24" stopColor={phase.current} stopOpacity="0.96" />
          <Stop offset="1" stopColor={brand.purple} stopOpacity="0.28" />
        </RadialGradient>
        <SvgLinearGradient id="orbitLine" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={brand.rose} stopOpacity="0.28" />
          <Stop offset="0.52" stopColor={brand.ink} stopOpacity="0.72" />
          <Stop offset="1" stopColor={brand.gold} stopOpacity="0.3" />
        </SvgLinearGradient>
      </Defs>

      {BACKGROUND_STARS.map(([x, y, radius], index) => (
        <Circle
          key={index}
          cx={x}
          cy={y}
          r={radius}
          fill={index % 5 === 0 ? brand.gold : brand.ink}
          opacity={index % 3 === 0 ? 0.68 : 0.34}
        />
      ))}

      {points.length > 1 ? (
        <Polyline
          points={trail}
          fill="none"
          stroke={brand.rose}
          strokeWidth="0.8"
          strokeOpacity="0.26"
        />
      ) : null}

      {points.map((point) => (
        <Circle
          key={`${point.day}-${point.x}`}
          cx={point.x}
          cy={point.y}
          r="2.4"
          fill={brand.rose}
          opacity="0.74"
        />
      ))}

      <Circle cx="170" cy="113" r="61" fill={phase.current} opacity="0.055" />
      <Circle
        cx="170"
        cy="113"
        r="43"
        fill="url(#nightCore)"
        opacity={inactive ? 0.44 : 1}
      />
      <Circle cx="158" cy="99" r="9" fill={brand.ink} opacity="0.12" />
      <Ellipse
        cx="170"
        cy="113"
        rx="82"
        ry="29"
        fill="none"
        stroke="url(#orbitLine)"
        strokeWidth="1.2"
        transform="rotate(-12 170 113)"
      />

      {nodes.map((node, index) => (
        <Circle
          key={index}
          cx={node.x}
          cy={node.y}
          r={node.current && night > 0 ? 3.5 : node.active ? 2.4 : 1.65}
          fill={
            node.current && night > 0
              ? brand.gold
              : node.active
                ? brand.rose
                : brand.inkFaint
          }
          transform="rotate(-12 170 113)"
        />
      ))}

      <SvgText
        x="170"
        y="109"
        fill={brand.inkMid}
        fontFamily="Manrope"
        fontSize="7.5"
        fontWeight="600"
        letterSpacing="1.2"
        textAnchor="middle"
      >
        {inactive ? 'WAITING' : 'NIGHT'}
      </SvgText>
      <SvgText
        x="170"
        y="127"
        fill={brand.ink}
        fontFamily="Instrument Serif"
        fontSize="24"
        textAnchor="middle"
      >
        {inactive ? '—' : String(night).padStart(2, '0')}
      </SvgText>

      {night > 0 ? (
        <Path
          d="M170 47 L173 54 L180 57 L173 60 L170 67 L167 60 L160 57 L167 54 Z"
          fill={brand.gold}
          opacity="0.9"
        />
      ) : null}
    </Svg>
  );
}

export default function LivingNightScene({
  night,
  prompt,
  entries,
  userId,
  sealed,
  partnerPresent,
  inactive = false,
  compact = false,
  celebrate = false,
  actionLabel,
  onPress,
}: {
  night: number;
  prompt: string;
  entries: SkyEntry[];
  userId: number;
  sealed: boolean;
  partnerPresent: boolean;
  inactive?: boolean;
  compact?: boolean;
  celebrate?: boolean;
  actionLabel?: string;
  onPress?: () => void;
}) {
  const safeNight = Math.min(TOTAL_NIGHTS, Math.max(0, night));
  const phase = ritualPhaseTheme(Math.max(1, safeNight));
  const [reduceMotion, setReduceMotion] = useState(false);
  const [twinkle] = useState(() => new Animated.Value(0));
  const [sealStar] = useState(() => new Animated.Value(0));

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
      twinkle.setValue(0.35);
      return;
    }
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(twinkle, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(twinkle, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [reduceMotion, twinkle]);

  useEffect(() => {
    if (!celebrate) return;
    if (reduceMotion) {
      sealStar.setValue(1);
      return;
    }
    sealStar.setValue(0);
    Animated.timing(sealStar, {
      toValue: 1,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [celebrate, reduceMotion, sealStar]);

  const rail = useMemo(
    () =>
      Array.from({ length: TOTAL_NIGHTS }, (_, index) => ({
        complete: index < safeNight,
        current: index === safeNight - 1,
      })),
    [safeNight],
  );

  const content = (
    <LinearGradient
      colors={phase.background}
      locations={[0, 1]}
      style={[styles.scene, compact && styles.sceneCompact]}
    >
      <View pointerEvents="none" style={styles.ambientOrb} />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.twinkle,
          {
            opacity: twinkle.interpolate({
              inputRange: [0, 1],
              outputRange: [0.18, 0.72],
            }),
          },
        ]}
      />

      <View style={styles.topline}>
        <View>
          <Text style={styles.kicker}>{inactive ? 'PRIVATE RITUAL' : 'PRIVATE NIGHT'}</Text>
          <Text style={styles.phaseName}>{inactive ? 'Your 21 nights' : phase.label}</Text>
        </View>
        <View style={styles.counterBadge}>
          <Text style={styles.counterText}>
            {inactive ? 'NOT ACTIVE' : `${String(safeNight).padStart(2, '0')} / 21`}
          </Text>
        </View>
      </View>

      <View style={styles.rail}>
        {rail.map((part, index) => (
          <View
            key={index}
            style={[
              styles.railPart,
              part.complete && { backgroundColor: phase.active },
              part.current && styles.railCurrent,
            ]}
          />
        ))}
      </View>

      <View style={styles.artwork}>
        <SkyArtwork
          night={safeNight}
          entries={entries}
          userId={userId}
          inactive={inactive}
        />
        {celebrate ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.sealStar,
              {
                opacity: sealStar,
                transform: [
                  {
                    translateY: sealStar.interpolate({
                      inputRange: [0, 1],
                      outputRange: [88, -42],
                    }),
                  },
                  {
                    scale: sealStar.interpolate({
                      inputRange: [0, 0.72, 1],
                      outputRange: [0.2, 1.45, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.sealStarCore} />
          </Animated.View>
        ) : null}
      </View>

      <View style={styles.story}>
        <Text style={styles.state}>
          {inactive ? 'THE ROOM IS CLOSED' : sealed ? 'TONIGHT IS SEALED' : 'TONIGHT’S PROMPT'}
        </Text>
        <Text style={[styles.prompt, compact && styles.promptCompact]}>
          {inactive
            ? 'A real connection opens the first night.'
            : sealed
              ? `Night ${safeNight} has joined your sky.`
              : prompt}
        </Text>
        <View style={styles.presenceRow}>
          <View
            style={[
              styles.presenceDot,
              { backgroundColor: partnerPresent ? brand.rose : brand.inkFaint },
            ]}
          />
          <Text style={styles.presence}>
            {inactive
              ? 'Nothing is simulated here.'
              : partnerPresent
                ? 'Another presence is visible. Their words remain private.'
                : 'The room is quiet. No response is required from anyone else.'}
          </Text>
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
      </View>
    </LinearGradient>
  );

  if (!onPress || !actionLabel) return content;
  return content;
}

const styles = StyleSheet.create({
  scene: {
    minHeight: 620,
    overflow: 'hidden',
    paddingHorizontal: space.lg,
    paddingTop: space.xl,
    paddingBottom: space.xl,
  },
  sceneCompact: { minHeight: 580 },
  ambientOrb: {
    position: 'absolute',
    width: 370,
    height: 370,
    borderRadius: 185,
    top: -210,
    right: -180,
    backgroundColor: 'rgba(248,242,255,0.055)',
  },
  twinkle: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 3,
    top: 166,
    right: 46,
    backgroundColor: brand.gold,
  },
  topline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kicker: { ...type.eyebrow, color: brand.rose, fontSize: 8.5, letterSpacing: 1.4 },
  phaseName: { ...type.display, color: brand.ink, fontSize: 28, lineHeight: 32, marginTop: 2 },
  counterBadge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: brand.inkFaint,
    borderRadius: 999,
    backgroundColor: 'rgba(8,5,15,0.24)',
  },
  counterText: {
    ...type.eyebrow,
    color: brand.inkMid,
    fontSize: 7.5,
    letterSpacing: 0.9,
  },
  rail: {
    flexDirection: 'row',
    gap: 3,
    marginTop: space.lg,
  },
  railPart: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: brand.inkFaint,
  },
  railCurrent: { height: 5, marginTop: -1, backgroundColor: brand.gold },
  artwork: {
    minHeight: MAP_HEIGHT,
    marginTop: space.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealStar: {
    position: 'absolute',
    left: '50%',
    top: 112,
    width: 22,
    height: 22,
    marginLeft: -11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealStarCore: {
    width: 10,
    height: 10,
    backgroundColor: brand.gold,
    transform: [{ rotate: '45deg' }],
    shadowColor: brand.gold,
    shadowOpacity: 0.8,
    shadowRadius: 14,
  },
  story: { marginTop: -2 },
  state: { ...type.eyebrow, color: brand.rose, fontSize: 8.5, letterSpacing: 1.3 },
  prompt: {
    ...type.display,
    color: brand.ink,
    fontSize: 35,
    lineHeight: 39,
    marginTop: space.sm,
  },
  promptCompact: { fontSize: 31, lineHeight: 35 },
  presenceRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: space.lg },
  presenceDot: { width: 7, height: 7, borderRadius: 4, marginTop: 4 },
  presence: {
    ...type.bodySmall,
    color: brand.inkMid,
    marginLeft: space.sm,
    flex: 1,
    lineHeight: 18,
  },
  action: {
    minHeight: 54,
    marginTop: space.lg,
    paddingHorizontal: space.lg,
    borderRadius: 18,
    backgroundColor: brand.rose,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionLabel: { ...type.bodyStrong, color: brand.void, fontSize: 14.5 },
  actionArrow: { color: brand.void, fontSize: 20 },
  pressed: { opacity: 0.76, transform: [{ scale: 0.99 }] },
});
