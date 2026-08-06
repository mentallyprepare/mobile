import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import { brand } from '../../design';

export default function StardustGuide({ size = 148 }: { size?: number }) {
  return (
    <Svg
      width={size}
      height={size * 0.82}
      viewBox="0 0 180 148"
      accessibilityRole="image"
      accessibilityLabel="A small glowing planet with an orbiting star"
    >
      <Defs>
        <RadialGradient id="planet" cx="35%" cy="25%" r="75%">
          <Stop offset="0" stopColor={brand.ink} />
          <Stop offset="0.42" stopColor={brand.purple} />
          <Stop offset="1" stopColor="#3A2B52" />
        </RadialGradient>
        <LinearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={brand.rose} />
          <Stop offset="0.5" stopColor={brand.gold} />
          <Stop offset="1" stopColor={brand.purple} />
        </LinearGradient>
        <RadialGradient id="glow">
          <Stop offset="0" stopColor={brand.purple} stopOpacity="0.65" />
          <Stop offset="1" stopColor={brand.purple} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Circle cx="90" cy="76" r="67" fill="url(#glow)" />
      <Ellipse
        cx="90"
        cy="82"
        rx="74"
        ry="24"
        fill="none"
        stroke="url(#ring)"
        strokeWidth="8"
        transform="rotate(-11 90 82)"
      />
      <Circle cx="90" cy="70" r="42" fill="url(#planet)" />
      <Ellipse cx="76" cy="55" rx="17" ry="10" fill="rgba(248,242,255,0.2)" />
      <G fill={brand.void}>
        <Circle cx="76" cy="72" r="3.5" />
        <Circle cx="103" cy="72" r="3.5" />
      </G>
      <Path
        d="M80 86c6 7 15 7 21 0"
        fill="none"
        stroke={brand.void}
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <Circle cx="67" cy="84" r="5" fill={brand.rose} opacity="0.55" />
      <Circle cx="113" cy="84" r="5" fill={brand.rose} opacity="0.55" />
      <Path
        d="M145 20l3.5 8.5L157 32l-8.5 3.5L145 44l-3.5-8.5L133 32l8.5-3.5L145 20z"
        fill={brand.gold}
      />
      <Circle cx="31" cy="44" r="4" fill={brand.rose} />
      <Circle cx="152" cy="94" r="3" fill={brand.ink} />
    </Svg>
  );
}
