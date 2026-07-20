import { View, Text, StyleSheet, useWindowDimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Polyline, Text as SvgText } from 'react-native-svg';
import NightBackground from '../../src/components/NightBackground';
import { ink, font, star, moon } from '../../src/theme';
import { useMe } from '../../src/api/me';
import { starPositions, TOTAL_NIGHTS } from '../../src/sky';

const VB_W = 320;
const VB_H = 440;

export default function SkyScreen() {
  const { width } = useWindowDimensions();
  const { data, loading } = useMe();

  const w = Math.min(width - 56, 320);
  const h = (w / VB_W) * VB_H;

  const userId = data?.user?.id ?? 0;
  const mine = starPositions(data?.entries ?? [], userId, { width: VB_W, height: VB_H });
  // Their sky: positions only, never content. Offset seed so the two skies
  // never land on identical jitter.
  const theirs = starPositions(data?.partnerEntries ?? [], userId + 7919, {
    width: VB_W,
    height: VB_H,
  });

  const written = mine.length;
  const dark = Math.max(0, TOTAL_NIGHTS - written);

  return (
    <View style={styles.root}>
      <NightBackground />
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.header}>
          {theirs.length > 0 ? <Text style={styles.theirLabel}>THEIR SKY →</Text> : null}
        </View>

        <View style={styles.canvas}>
          {loading ? (
            <ActivityIndicator color={moon.present} />
          ) : written === 0 ? (
            <Text style={styles.empty}>your first star. twenty nights of sky left.</Text>
          ) : (
            <Svg width={w} height={h} viewBox={`0 0 ${VB_W} ${VB_H}`}>
              {theirs.length > 1 ? (
                <Polyline
                  points={theirs.map((p) => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke={star.theirs}
                  strokeOpacity={0.3}
                  strokeWidth={1}
                  strokeDasharray="4 6"
                />
              ) : null}
              {theirs.map((p) => (
                <Circle
                  key={`t${p.day}`}
                  cx={p.x}
                  cy={p.y}
                  r={2.2}
                  fill={star.theirs}
                  fillOpacity={0.5}
                />
              ))}

              {mine.length > 1 ? (
                <Polyline
                  points={mine.map((p) => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke={star.yours}
                  strokeOpacity={0.35}
                  strokeWidth={1}
                />
              ) : null}
              {mine.map((p) => (
                <Circle key={p.day} cx={p.x} cy={p.y} r={3.2} fill={star.yours} />
              ))}
              {mine.map((p) => (
                <SvgText key={`n${p.day}`} x={p.x + 9} y={p.y + 4} fill={ink.mid} fontSize={9}>
                  {String(p.day)}
                </SvgText>
              ))}
            </Svg>
          )}
        </View>

        {!loading && written > 0 ? (
          <Text style={styles.caption}>
            {written} {written === 1 ? 'night' : 'nights'} written. {dark} still dark.
          </Text>
        ) : (
          <View style={styles.captionSpacer} />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  screen: { flex: 1 },
  header: { alignItems: 'flex-end', paddingHorizontal: 28, paddingTop: 16, minHeight: 30 },
  theirLabel: { fontFamily: font.body, fontSize: 10, letterSpacing: 1.8, color: ink.mid },
  canvas: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  empty: {
    fontFamily: font.displayItalic,
    fontSize: 22,
    lineHeight: 32,
    color: ink.mid,
    textAlign: 'center',
  },
  caption: {
    textAlign: 'center',
    paddingBottom: 24,
    fontFamily: font.body,
    fontSize: 12,
    color: ink.mid,
  },
  captionSpacer: { height: 36 },
});
