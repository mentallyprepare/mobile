import type { ColorValue } from 'react-native';
import Svg, { Path, Circle, Polyline, Rect } from 'react-native-svg';

type IconProps = { color: ColorValue; size?: number };

// Thin-line tab icons. Kept dependency-free (no icon font).

export function HomeIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function DiscoverIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={11} cy={11} r={7} stroke={color} strokeWidth={1.5} />
      <Path d="M20 20l-3.5-3.5" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

export function CreateIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5v14M5 12h14"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function RoomsIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x={3.5}
        y={5.5}
        width={17}
        height={13}
        rx={3}
        stroke={color}
        strokeWidth={1.5}
      />
      <Path d="M8 9h8M8 13h5" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

export function JourneyIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={3.5} y={5} width={17} height={15.5} rx={3} stroke={color} strokeWidth={1.5} />
      <Path d="M7 3v4M17 3v4M4 9.5h16M8 14h3M13 14h3" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

export function CommunityIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={9} cy={8} r={3} stroke={color} strokeWidth={1.5} />
      <Circle cx={17} cy={10} r={2.5} stroke={color} strokeWidth={1.5} />
      <Path d="M3.5 20v-1.5A4.5 4.5 0 0 1 8 14h2a4.5 4.5 0 0 1 4.5 4.5V20M14 15.5a4 4 0 0 1 6.5 3V20" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

export function YouIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={12} cy={7} r={4} stroke={color} strokeWidth={1.5} />
    </Svg>
  );
}

// Legacy Living-Night icons still imported by ritual screens. Left in place
// so slice 1 does not break their imports.

export function MoonIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function PulseIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polyline
        points="22 12 18 12 15 21 9 3 6 12 2 12"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function SparkIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11 4 L12.4 9.6 L18 11 L12.4 12.4 L11 18 L9.6 12.4 L4 11 L9.6 9.6 Z"
        stroke={color}
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function PersonIcon({ color, size = 22 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={12} cy={7} r={4} stroke={color} strokeWidth={1.5} />
    </Svg>
  );
}
