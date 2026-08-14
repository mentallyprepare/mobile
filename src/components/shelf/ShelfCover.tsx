import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { KIND_META, type ShelfItem, type ShelfKind } from '../../api/shelf';
import { brand, radius, type } from '../../design';

const TONES: Record<ShelfKind, [string, string]> = {
  song_a: [brand.rose, '#6B3D53'],
  song_b: [brand.purple, '#37274F'],
  film: [brand.gold, '#675333'],
  book: ['#B98AA8', '#503052'],
  memory: ['#4E3C6E', brand.sky],
};

function CoverArt({ kind }: { kind: ShelfKind }) {
  if (kind === 'song_a') {
    return (
      <View style={styles.art}>
        <View style={styles.vinyl}>
          <View style={styles.vinylRing} />
          <View style={styles.vinylCore} />
        </View>
      </View>
    );
  }

  if (kind === 'song_b') {
    return (
      <View style={styles.art}>
        <View style={[styles.wave, styles.waveOne]} />
        <View style={[styles.wave, styles.waveTwo]} />
        <View style={[styles.wave, styles.waveThree]} />
        <View style={[styles.wave, styles.waveFour]} />
      </View>
    );
  }

  if (kind === 'film') {
    return (
      <View style={styles.art}>
        <View style={[styles.frame, styles.frameOne]} />
        <View style={[styles.frame, styles.frameTwo]} />
        <View style={[styles.frame, styles.frameThree]} />
      </View>
    );
  }

  if (kind === 'book') {
    return (
      <View style={styles.art}>
        <View style={styles.bookShape}>
          <View style={styles.bookSpine} />
          <View style={styles.bookLine} />
          <View style={[styles.bookLine, styles.bookLineShort]} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.art}>
      <View style={styles.memorySun} />
      <View style={styles.memoryHorizon} />
      <View style={styles.memoryDot} />
    </View>
  );
}

export default function ShelfCover({
  kind,
  item,
  available,
  index,
  onPress,
  wide = false,
  style,
}: {
  kind: ShelfKind;
  item?: ShelfItem;
  available: boolean;
  index: number;
  onPress: () => void;
  wide?: boolean;
  style?: ViewStyle;
}) {
  const meta = KIND_META[kind];
  const isEmpty = !item;
  const content = (
    <>
      <View style={styles.topline}>
        <Text style={styles.kind}>{meta.label.toUpperCase()}</Text>
        <Text style={styles.index}>{String(index).padStart(2, '0')}</Text>
      </View>
      {isEmpty && available ? (
        <View style={styles.addMark} accessible={false}>
          <Text style={styles.addMarkText}>+</Text>
        </View>
      ) : null}
      <View style={styles.copy}>
        <Text style={[styles.title, wide && styles.titleWide]} numberOfLines={wide ? 2 : 4}>
          {item?.title || (available ? `Add ${meta.label}` : 'Coming later')}
        </Text>
        {item?.detail ? (
          <Text style={styles.detail} numberOfLines={1}>{item.detail}</Text>
        ) : (
          <Text style={styles.detail}>{available ? 'Choose something that feels like you' : 'Not available yet'}</Text>
        )}
      </View>
    </>
  );

  return (
    <Pressable
      onPress={available ? onPress : undefined}
      disabled={!available}
      accessibilityRole="button"
      accessibilityLabel={
        item ? `${meta.label}: ${item.title}` : available ? `Add ${meta.label}` : `${meta.label}, coming later`
      }
      style={({ pressed }) => [
        styles.shell,
        wide && styles.shellWide,
        !available && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {item?.artworkUrl ? (
        <ImageBackground
          source={{ uri: item.artworkUrl }}
          resizeMode="cover"
          style={styles.fill}
          imageStyle={styles.image}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.88)']}
            style={styles.content}
          >
            {content}
          </LinearGradient>
        </ImageBackground>
      ) : (
        <LinearGradient colors={TONES[kind]} style={styles.content}>
          <CoverArt kind={kind} />
          <LinearGradient
            colors={['rgba(8,5,15,0)', 'rgba(8,5,15,0.76)']}
            locations={[0.38, 1]}
            pointerEvents="none"
            style={styles.bottomFade}
          />
          {content}
        </LinearGradient>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shell: {
    width: 150,
    height: 198,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: brand.card,
    borderWidth: 1,
    borderColor: brand.line,
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  shellWide: { width: '100%', height: 152 },
  fill: { flex: 1 },
  image: { borderRadius: radius.md },
  content: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  bottomFade: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    height: '68%',
  },
  topline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  index: {
    ...type.bodyStrong,
    color: 'rgba(248,242,255,0.82)',
    fontSize: 10,
    textShadowColor: 'rgba(8,5,15,0.55)',
    textShadowRadius: 5,
  },
  kind: {
    ...type.eyebrow,
    color: brand.ink,
    fontSize: 8,
    letterSpacing: 1,
    textShadowColor: 'rgba(8,5,15,0.65)',
    textShadowRadius: 5,
  },
  copy: {
    zIndex: 1,
    minHeight: 58,
    justifyContent: 'flex-end',
  },
  title: {
    ...type.bodyStrong,
    color: brand.ink,
    fontSize: 18,
    lineHeight: 21,
  },
  titleWide: { fontSize: 29, lineHeight: 31, maxWidth: '72%' },
  detail: {
    ...type.bodySmall,
    color: brand.inkMid,
    fontSize: 11,
    marginTop: 5,
  },
  addMark: {
    position: 'absolute',
    top: 62,
    left: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(248,242,255,0.52)',
    backgroundColor: 'rgba(8,5,15,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  addMarkText: {
    color: brand.ink,
    fontSize: 24,
    lineHeight: 27,
    fontFamily: type.bodyStrong.fontFamily,
  },
  art: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
  },
  vinyl: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    right: -36,
    top: 28,
    borderWidth: 22,
    borderColor: 'rgba(45,3,25,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vinylRing: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
  },
  vinylCore: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: brand.gold,
  },
  wave: {
    position: 'absolute',
    width: 190,
    height: 36,
    borderRadius: 18,
    borderWidth: 8,
    borderColor: 'rgba(124,234,255,0.34)',
    transform: [{ rotate: '-18deg' }],
  },
  waveOne: { top: 18, left: -34 },
  waveTwo: { top: 62, left: -8 },
  waveThree: { top: 106, left: -28 },
  waveFour: { top: 150, left: 5 },
  frame: {
    position: 'absolute',
    width: 112,
    height: 72,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    backgroundColor: 'rgba(34,10,58,0.18)',
  },
  frameOne: { top: 28, left: 54, transform: [{ rotate: '8deg' }] },
  frameTwo: { top: 76, left: 18, transform: [{ rotate: '-8deg' }] },
  frameThree: { top: 132, left: 62, transform: [{ rotate: '5deg' }] },
  bookShape: {
    position: 'absolute',
    top: 28,
    right: -10,
    width: 124,
    height: 148,
    borderRadius: 4,
    backgroundColor: 'rgba(255,227,240,0.2)',
    transform: [{ rotate: '9deg' }],
    padding: 20,
  },
  bookSpine: {
    position: 'absolute',
    left: 12,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.32)',
  },
  bookLine: {
    height: 2,
    marginTop: 54,
    backgroundColor: 'rgba(255,255,255,0.38)',
  },
  bookLineShort: { width: '62%', marginTop: 10 },
  memorySun: {
    position: 'absolute',
    top: 24,
    right: 30,
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: 'rgba(255,213,117,0.6)',
  },
  memoryHorizon: {
    position: 'absolute',
    left: -28,
    right: -28,
    bottom: 34,
    height: 80,
    borderRadius: 80,
    backgroundColor: 'rgba(5,49,61,0.42)',
    transform: [{ rotate: '-5deg' }],
  },
  memoryDot: {
    position: 'absolute',
    top: 34,
    right: 38,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: brand.ink,
  },
  disabled: { opacity: 0.64 },
  pressed: { opacity: 0.76, transform: [{ scale: 0.985 }] },
});
