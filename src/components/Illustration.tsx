import { View, type ViewStyle } from 'react-native';
import { brand, daylight, radius } from '../design';

/**
 * Pluggable illustration slot. Screens declare a slot name; the manifest maps
 * it to an asset when one is registered. Until then it renders a tasteful
 * matte placeholder in the slot's accent, so layouts never break on a missing
 * asset. See docs/design-daylight-world.md.
 */
export type IllustrationSlot =
  | 'home-hero'
  | 'shelf-empty'
  | 'room-empty'
  | 'discover-empty'
  | 'spark-received'
  | 'you-hero';

type Palette = { fg: string; bg: string };

const PLACEHOLDER: Record<IllustrationSlot, Palette> = {
  'home-hero': { fg: daylight.accent, bg: daylight.bgAlt },
  'shelf-empty': { fg: daylight.accentRose, bg: '#1A1018' },
  'room-empty': { fg: daylight.accent, bg: daylight.bgAlt },
  'discover-empty': { fg: daylight.accentBlue, bg: '#171024' },
  'spark-received': { fg: daylight.accentAmber, bg: '#18140D' },
  'you-hero': { fg: daylight.accentMoss, bg: brand.card },
};

// Registered assets go here as they are authored. Empty for now on purpose.
const REGISTRY: Partial<Record<IllustrationSlot, number>> = {};

type IllustrationProps = {
  slot: IllustrationSlot;
  size?: number;
  style?: ViewStyle;
};

export default function Illustration({ slot, size = 96, style }: IllustrationProps) {
  const asset = REGISTRY[slot];
  if (asset) {
    // Real asset path lands here once an illustration is registered.
    // (Image import kept out of slice 1 to avoid an unused-require warning.)
  }
  const palette = PLACEHOLDER[slot];
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel="illustration placeholder"
      style={[
        {
          width: size,
          height: size,
          borderRadius: radius.lg,
          backgroundColor: palette.bg,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {/* A rounded shape in the slot's accent, no faces. */}
      <View
        style={{
          width: size * 0.52,
          height: size * 0.52,
          borderRadius: size * 0.26,
          backgroundColor: palette.fg,
          opacity: 0.7,
        }}
      />
    </View>
  );
}
