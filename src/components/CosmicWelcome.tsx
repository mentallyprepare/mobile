import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Ellipse, Text as SvgText } from 'react-native-svg';
import { brand, radius, space, type } from '../design';

const NIGHT_NODES = Array.from({ length: 21 }, (_, index) => {
  const angle = (index / 21) * Math.PI * 2 - Math.PI / 2;
  return {
    x: 48 + Math.cos(angle) * 37,
    y: 48 + Math.sin(angle) * 17,
  };
});

function RitualSignal({ compact }: { compact: boolean }) {
  const size = compact ? 68 : 96;

  return (
    <View style={[styles.signal, compact && styles.compactSignal]}>
      <Svg
        width={size}
        height={size}
        viewBox="0 0 96 96"
        accessibilityRole="image"
        accessibilityLabel="Night one on the twenty-one-night orbit"
      >
        <Ellipse
          cx="48"
          cy="48"
          rx="37"
          ry="17"
          fill="none"
          stroke={brand.inkFaint}
          strokeWidth="1"
        />
        {NIGHT_NODES.map((node, index) => (
          <Circle
            key={index}
            cx={node.x}
            cy={node.y}
            r={index === 0 ? 2.8 : 1.25}
            fill={index === 0 ? brand.rose : brand.inkLow}
          />
        ))}
        <Circle cx="48" cy="48" r="17" fill={brand.purple} />
        <Circle cx="42" cy="42" r="4" fill={brand.ink} opacity="0.16" />
        <SvgText
          x="48"
          y="52"
          fill={brand.ink}
          fontFamily="Manrope"
          fontSize="10"
          fontWeight="600"
          textAnchor="middle"
        >
          01
        </SvgText>
      </Svg>
    </View>
  );
}

/** A code-drawn product prelude used for the reflective scan. */
export default function CosmicWelcome({ compact = false }: { compact?: boolean }) {
  return (
    <View
      style={[styles.panel, compact && styles.compact]}
      accessibilityRole="summary"
      accessibilityLabel="A quiet place to notice what is true for you"
    >
      <View style={styles.roseRule} />
      <RitualSignal compact={compact} />
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>MENTALLY PREPARE</Text>
        <Text style={[styles.title, compact && styles.compactTitle]}>make room for what is true.</Text>
        {!compact ? <Text style={styles.body}>A few honest answers are enough to begin.</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    minHeight: 174,
    borderRadius: radius.xl,
    padding: space.xl,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: brand.card,
    borderWidth: 1,
    borderColor: brand.line,
  },
  compact: { minHeight: 112, padding: space.lg },
  roseRule: {
    position: 'absolute',
    left: 0,
    top: 24,
    bottom: 24,
    width: 3,
    borderTopRightRadius: radius.pill,
    borderBottomRightRadius: radius.pill,
    backgroundColor: brand.rose,
  },
  signal: {
    width: 96,
    height: 96,
    marginRight: space.lg,
    borderRadius: radius.lg,
    backgroundColor: brand.void,
    borderWidth: 1,
    borderColor: brand.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactSignal: { width: 68, height: 68 },
  copy: { flex: 1 },
  eyebrow: { ...type.eyebrow, color: brand.rose, letterSpacing: 1.4, fontSize: 10 },
  title: { ...type.displayItalic, color: brand.ink, fontSize: 28, lineHeight: 32, marginTop: 8 },
  compactTitle: { fontSize: 22, lineHeight: 26 },
  body: { ...type.bodySmall, color: 'rgba(248,242,255,0.78)', marginTop: 8 },
});
