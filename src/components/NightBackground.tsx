import { StyleSheet, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { glow, sky } from '../theme';

/**
 * Ambient ground. Two soft radial glows over the night, matching the web app's
 * body treatment so cards sit on something rather than floating on flat black.
 * Static — this is not an animation.
 */
export default function NightBackground() {
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: sky.late }]} pointerEvents="none">
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <RadialGradient id="roseGlow" cx="14%" cy="4%" r="52%">
            <Stop offset="0" stopColor={glow.rose} stopOpacity={glow.roseOpacity} />
            <Stop offset="1" stopColor={glow.rose} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="purpleGlow" cx="86%" cy="9%" r="56%">
            <Stop offset="0" stopColor={glow.purple} stopOpacity={glow.purpleOpacity} />
            <Stop offset="1" stopColor={glow.purple} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#roseGlow)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#purpleGlow)" />
      </Svg>
    </View>
  );
}
