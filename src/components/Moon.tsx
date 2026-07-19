import { useId } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, Mask } from 'react-native-svg';
import { moon } from '../theme';

type MoonProps = {
  /** True once the match has sealed something tonight. Warms the moon. */
  present?: boolean;
  size?: number;
};

/**
 * The presence moon. Quiet when the match hasn't written, warm when they have.
 *
 * The crescent is cut with a mask rather than by overlaying a background-coloured
 * disc — the night has radial glows behind it, so a solid carve would show up as
 * a dark circle instead of disappearing.
 */
export default function Moon({ present = false, size = 38 }: MoonProps) {
  // SVG ids must be unique per instance and must not contain ':'.
  const maskId = `moonCrescent-${useId().replace(/:/g, '_')}`;
  const face = present ? moon.present : moon.quiet;

  return (
    <View
      style={[
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
        <Defs>
          <Mask id={maskId}>
            <Circle cx={26} cy={28} r={24} fill="#fff" />
            <Circle cx={40} cy={21} r={22} fill="#000" />
          </Mask>
        </Defs>
        <Circle cx={26} cy={28} r={24} fill={face} mask={`url(#${maskId})`} />
        {/* Tonight's entry */}
        <Circle cx={16} cy={13} r={1.5} fill="#EFEAFF" />
      </Svg>
    </View>
  );
}
