import { View, Text, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ink, font, sky } from '../src/theme';

// Starting screen. The night, and the mark. Nothing computed, nothing loud.
export default function Home() {
  return (
    <View style={styles.sky}>
      <View style={styles.glow} pointerEvents="none" />
      <SafeAreaView style={styles.center}>
        <Image
          source={require('../assets/images/android-icon-foreground.png')}
          style={styles.mark}
          resizeMode="contain"
        />
        <Text style={styles.wordmark}>mentally prepare</Text>
        <Text style={styles.tagline}>A 21-DAY ANONYMOUS EMOTIONAL RESET</Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  sky: {
    flex: 1,
    backgroundColor: sky.late,
  },
  glow: {
    position: 'absolute',
    top: '10%',
    alignSelf: 'center',
    width: 460,
    height: 460,
    borderRadius: 230,
    backgroundColor: 'rgba(64,54,112,0.35)',
    opacity: 0.9,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 22,
  },
  mark: {
    width: 220,
    height: 144,
  },
  wordmark: {
    fontFamily: font.display,
    fontSize: 44,
    color: ink.high,
    textAlign: 'center',
    lineHeight: 48,
  },
  tagline: {
    fontFamily: font.body,
    fontSize: 12,
    letterSpacing: 2.5,
    color: ink.mid,
    textAlign: 'center',
  },
});
