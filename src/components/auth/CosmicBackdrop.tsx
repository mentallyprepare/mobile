import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { brand } from '../../design';

const STARS = [
  [8, 10, 2], [18, 22, 3], [31, 8, 2], [43, 18, 2], [57, 7, 3],
  [69, 25, 2], [83, 12, 2], [93, 29, 3], [12, 43, 2], [27, 35, 2],
  [74, 45, 3], [89, 52, 2], [48, 39, 2], [61, 57, 2],
] as const;

export default function CosmicBackdrop() {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.clip]}>
      <LinearGradient
        colors={[brand.void, brand.sky, '#1E1330', '#3A2330']}
        locations={[0, 0.42, 0.76, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.violetGlow} />
      <View style={styles.roseGlow} />
      {STARS.map(([left, top, size], index) => (
        <View
          key={`${left}-${top}`}
          style={[
            styles.star,
            {
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              borderRadius: size,
              opacity: index % 3 === 0 ? 0.9 : 0.55,
            },
          ]}
        />
      ))}
      <View style={[styles.cloud, styles.cloudLeft]}>
        <View style={[styles.cloudBubble, { width: 50, height: 25 }]} />
        <View style={[styles.cloudBubble, styles.cloudBubbleRaised]} />
      </View>
      <View style={[styles.cloud, styles.cloudRight]}>
        <View style={[styles.cloudBubble, { width: 58, height: 28 }]} />
        <View style={[styles.cloudBubble, styles.cloudBubbleRaised]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
  violetGlow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    top: -120,
    right: -100,
    backgroundColor: 'rgba(137,108,181,0.22)',
  },
  roseGlow: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    bottom: -190,
    left: -130,
    backgroundColor: 'rgba(235,180,194,0.20)',
  },
  star: { position: 'absolute', backgroundColor: brand.ink },
  cloud: {
    position: 'absolute',
    flexDirection: 'row',
    opacity: 0.18,
  },
  cloudLeft: { top: 118, left: -18 },
  cloudRight: { top: 190, right: -24, transform: [{ scale: 0.82 }] },
  cloudBubble: {
    borderRadius: 999,
    backgroundColor: brand.purple,
  },
  cloudBubbleRaised: {
    width: 42,
    height: 30,
    marginLeft: -16,
    marginTop: -8,
    borderRadius: 999,
    backgroundColor: brand.purple,
  },
});
