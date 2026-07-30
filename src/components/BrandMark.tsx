import Svg, { Circle, Ellipse } from 'react-native-svg';
import { brand } from '../design';

/** The product mark: one person, one orbit, twenty-one nights. */
export default function BrandMark({ size = 54 }: { size?: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      accessibilityRole="image"
      accessibilityLabel="Mentally Prepare"
    >
      <Ellipse
        cx="32"
        cy="32"
        rx="27"
        ry="10"
        fill="none"
        stroke={brand.gold}
        strokeWidth="2"
        transform="rotate(-18 32 32)"
      />
      <Circle cx="32" cy="32" r="13" fill={brand.purple} />
      <Circle cx="48" cy="17" r="3" fill={brand.rose} />
      <Circle cx="15" cy="44" r="2" fill={brand.gold} />
    </Svg>
  );
}
