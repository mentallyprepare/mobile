import { useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { starPositions, TOTAL_NIGHTS, type SkyEntry } from '../../sky';
import { brand, space, type } from '../../design';

/**
 * The Journey sky — one star per sealed night, positioned per the math in
 * src/sky.ts (x spreads across the 21 nights, y comes from the seal
 * timestamp, jitter is seeded from userId so a person's sky is identical on
 * every visit).
 *
 * The user's stars are drawn in the accent rose. The partner's stars appear
 * as fainter ink dots so the two skies read as one shared night without
 * either identity crossing the other.
 *
 * Tapping a user star reports the night up so the parent can navigate
 * (currently: to the writing surface); tapping empty space clears the
 * highlighted night if one was set.
 */
export type ConstellationProps = {
  entries: SkyEntry[];
  partnerEntries: SkyEntry[];
  userId: number;
  onSelectNight?: (night: number) => void;
};

const DEFAULT_HEIGHT = 260;

export default function Constellation({
  entries,
  partnerEntries,
  userId,
  onSelectNight,
}: ConstellationProps) {
  const [width, setWidth] = useState(0);
  const [highlighted, setHighlighted] = useState<number | null>(null);

  function onLayout(e: LayoutChangeEvent) {
    setWidth(e.nativeEvent.layout.width);
  }

  const bounds = { width, height: DEFAULT_HEIGHT, pad: 24 };
  const myStars = width > 0 ? starPositions(entries, userId, bounds) : [];
  const partnerStars =
    width > 0 ? starPositions(partnerEntries, -userId, bounds) : [];

  // A gentle vertical band suggests the night as a whole, not any specific
  // hour. Drawn once — the stars are what breathes.
  const midY = DEFAULT_HEIGHT / 2;

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Your sky</Text>
        <Text style={styles.subtitle}>
          {myStars.length} of {TOTAL_NIGHTS} nights sealed
        </Text>
      </View>

      {width > 0 ? (
        <View style={styles.canvas} accessibilityLabel="Constellation of sealed nights">
          <Svg width={width} height={DEFAULT_HEIGHT}>
            {/* faint horizontal midline for visual anchoring */}
            <Line
              x1={bounds.pad}
              y1={midY}
              x2={width - bounds.pad}
              y2={midY}
              stroke={brand.inkFaint}
              strokeWidth={0.5}
              opacity={0.35}
            />

            {/* partner stars first so ours draw on top of collisions */}
            {partnerStars.map((s) => (
              <Circle
                key={`p-${s.day}`}
                cx={s.x}
                cy={s.y}
                r={2.5}
                fill={brand.inkFaint}
                opacity={0.6}
              />
            ))}

            {/* my stars */}
            {myStars.map((s) => {
              const isHi = highlighted === s.day;
              return (
                <Circle
                  key={`m-${s.day}`}
                  cx={s.x}
                  cy={s.y}
                  r={isHi ? 6 : 4}
                  fill={brand.rose}
                  opacity={isHi ? 1 : 0.9}
                />
              );
            })}
          </Svg>

          {/* Overlay tap targets — SVG onPress is unreliable on RN web, so
              hit-testable RN Views sit above each star with the right size. */}
          {myStars.map((s) => (
            <Pressable
              key={`hit-${s.day}`}
              onPress={() => {
                setHighlighted(s.day);
                onSelectNight?.(s.day);
              }}
              accessibilityRole="button"
              accessibilityLabel={`Night ${s.day} sealed`}
              hitSlop={12}
              style={[
                styles.hit,
                {
                  left: s.x - 16,
                  top: s.y - 16,
                },
              ]}
            />
          ))}
        </View>
      ) : (
        <View style={[styles.canvas, { height: DEFAULT_HEIGHT }]} />
      )}

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: brand.rose }]} />
          <Text style={styles.legendLabel}>yours</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: brand.inkFaint }]} />
          <Text style={styles.legendLabel}>theirs</Text>
        </View>
        {highlighted !== null ? (
          <Text style={styles.highlight}>
            Night {String(highlighted).padStart(2, '0')}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: space.xl },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: space.md,
  },
  title: { ...type.bodyStrong, color: brand.ink, fontSize: 15 },
  subtitle: { ...type.bodySmall, color: brand.inkMid },
  canvas: { width: '100%' },
  hit: { position: 'absolute', width: 32, height: 32 },
  legendRow: {
    marginTop: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.lg,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { ...type.bodySmall, color: brand.inkMid },
  highlight: {
    ...type.bodyStrong,
    color: brand.rose,
    fontSize: 12,
    marginLeft: 'auto',
  },
});
