import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { brand } from '../../design';

export default function AppBackdrop() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[brand.sky, brand.void, brand.void]}
        locations={[0, 0.38, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.violetField} />
      <View style={styles.roseField} />
      <View style={styles.starA} />
      <View style={styles.starB} />
      <View style={styles.starC} />
    </View>
  );
}

const styles = StyleSheet.create({
  violetField: {
    position: 'absolute',
    width: 360,
    height: 360,
    borderRadius: 180,
    top: -220,
    right: -130,
    backgroundColor: 'rgba(137,108,181,0.20)',
  },
  roseField: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    bottom: -220,
    left: -170,
    backgroundColor: 'rgba(235,180,194,0.08)',
  },
  starA: {
    position: 'absolute',
    top: 108,
    left: 36,
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.72)',
  },
  starB: {
    position: 'absolute',
    top: 166,
    right: 54,
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(236,200,133,0.82)',
  },
  starC: {
    position: 'absolute',
    top: 292,
    left: 76,
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(240,194,255,0.64)',
  },
});
