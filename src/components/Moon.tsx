import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { moon, sky } from '../theme';

type MoonProps = {
  /** True once the match has sealed something tonight. Warms the moon. */
  present?: boolean;
  size?: number;
};

/**
 * The presence moon. Quiet when the match hasn't written, warm when they have.
 * The crescent is carved by overlaying a sky-coloured disc on a lit one, so it
 * stays a solid shape at any size.
 */
export default function Moon({ present = false, size = 38 }: MoonProps) {
  const face = present ? moon.present : moon.quiet;
  return (
    <View
      style={[
        // Constrain the wrapper to the moon, or the glow renders as a box.
        { width: size, height: size, borderRadius: size / 2, alignSelf: 'flex-start' },
        present && {
          // Quiet bloom. The moon should feel noticed, not lit up.
          shadowColor: moon.present,
          shadowOpacity: 0.3,
          shadowRadius: 9,
          shadowOffset: { width: 0, height: 0 },
          elevation: 3,
        },
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 56 56">
        <Circle cx={26} cy={28} r={24} fill={face} />
        {/* Carve the crescent */}
        <Circle cx={40} cy={22} r={22} fill={sky.late} />
        {/* Tonight's entry */}
        <Circle cx={17} cy={13} r={1.5} fill="#EFEAFF" />
      </Svg>
    </View>
  );
}
