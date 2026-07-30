import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { brand, type } from '../../design';

export default function OrbitTrack({
  current,
  total = 21,
  size = 178,
  activeColor = brand.rose,
  currentColor = brand.gold,
}: {
  current: number;
  total?: number;
  size?: number;
  activeColor?: string;
  currentColor?: string;
}) {
  const center = size / 2;
  const radius = size * 0.39;
  const safeCurrent = Math.min(Math.max(current, 0), total);
  const dots = Array.from({ length: total }, (_, index) => {
    const angle = -Math.PI / 2 + (index / total) * Math.PI * 2;
    return {
      x: center + Math.cos(angle) * radius,
      y: center + Math.sin(angle) * radius,
      active: index < safeCurrent,
      current: index === safeCurrent - 1,
    };
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="rgba(8,5,15,0.24)"
          stroke={brand.line}
          strokeWidth={1}
        />
        {dots.map((dot, index) => (
          <Circle
            key={index}
            cx={dot.x}
            cy={dot.y}
            r={dot.current ? 5.2 : dot.active ? 3.8 : 2.5}
            fill={
              dot.current
                ? currentColor
                : dot.active
                  ? activeColor
                  : brand.inkFaint
            }
          />
        ))}
      </Svg>
      <View style={styles.center}>
        <Text style={styles.night}>night</Text>
        <Text style={styles.number}>{safeCurrent || '—'}</Text>
        <Text style={styles.total}>of {total}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  night: {
    ...type.eyebrow,
    fontSize: 9,
    color: brand.inkMid,
    textTransform: 'uppercase',
  },
  number: {
    ...type.displayItalic,
    fontSize: 40,
    lineHeight: 42,
    color: brand.ink,
  },
  total: { ...type.bodySmall, color: brand.inkMid },
});
