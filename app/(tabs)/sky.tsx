import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Polyline, Text as SvgText } from 'react-native-svg';
import { ink, font, sky as skyTokens, star } from '../../src/theme';

const VB_W = 320;
const VB_H = 440;

// Placeholder geometry. Real positions come from entry timestamps, with x
// jittered from hash(userId, day) and y derived from seal time — see
// docs/brief-living-night.md phase 2.
const YOURS = [
  { day: 1, x: 148, y: 96 },
  { day: 2, x: 248, y: 54 },
  { day: 3, x: 274, y: 166 },
  { day: 4, x: 228, y: 268 },
  { day: 5, x: 146, y: 212 },
  { day: 6, x: 70, y: 128 },
  { day: 7, x: 44, y: 250 },
  { day: 8, x: 108, y: 350 },
];

// Tonight, not yet sealed. Kept clear of the sealed stars.
const PENDING = { x: 214, y: 386 };

const THEIRS = [
  { x: 194, y: 78 },
  { x: 262, y: 112 },
  { x: 240, y: 208 },
  { x: 282, y: 302 },
  { x: 186, y: 332 },
  { x: 104, y: 298 },
  { x: 58, y: 188 },
  { x: 116, y: 58 },
];

export default function SkyScreen() {
  const { width } = useWindowDimensions();
  const w = Math.min(width - 56, 320);
  const h = (w / VB_W) * VB_H;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.theirLabel}>THEIR SKY →</Text>
      </View>

      <View style={styles.canvas}>
        <Svg width={w} height={h} viewBox={`0 0 ${VB_W} ${VB_H}`}>
          {/* their sky: positions only, never content */}
          <Polyline
            points={THEIRS.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke={star.theirs}
            strokeOpacity={0.3}
            strokeWidth={1}
            strokeDasharray="4 6"
          />
          {THEIRS.map((p) => (
            <Circle key={`t${p.x}-${p.y}`} cx={p.x} cy={p.y} r={2.2} fill={star.theirs} fillOpacity={0.5} />
          ))}

          {/* your sky */}
          <Polyline
            points={YOURS.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke={star.yours}
            strokeOpacity={0.35}
            strokeWidth={1}
          />
          {YOURS.map((p) => (
            <Circle key={p.day} cx={p.x} cy={p.y} r={3.2} fill={star.yours} />
          ))}
          {YOURS.map((p) => (
            <SvgText
              key={`n${p.day}`}
              x={p.x + 9}
              y={p.y + 4}
              fill={ink.mid}
              fontSize={9}
            >
              {String(p.day)}
            </SvgText>
          ))}

          {/* tonight, not yet sealed */}
          <Circle cx={PENDING.x} cy={PENDING.y} r={4.6} fill={star.pending} />
        </Svg>
      </View>

      <Text style={styles.caption}>8 nights written. 13 still dark.</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: skyTokens.late },
  header: { alignItems: 'flex-end', paddingHorizontal: 28, paddingTop: 16 },
  theirLabel: { fontFamily: font.body, fontSize: 10, letterSpacing: 1.8, color: ink.mid },
  canvas: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  caption: {
    textAlign: 'center',
    paddingBottom: 24,
    fontFamily: font.body,
    fontSize: 12,
    color: ink.mid,
  },
});
