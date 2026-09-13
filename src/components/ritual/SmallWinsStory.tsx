import { useEffect, useMemo, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
  type LayoutChangeEvent,
} from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { brand, font, radius, space, type } from '../../design';
import { t } from '../../i18n';
import { useLanguage } from '../../i18n/react';
import PrimaryButton from '../PrimaryButton';

const TOTAL = 21;

type Props = {
  /** Open the story. Reset happens each time this flips to true. */
  visible: boolean;
  /** The night just sealed (1..21). Drives the orbit and milestone copy. */
  night: number;
  /** The line the person wrote — shown back to them as "tonight's win". */
  win: string;
  onClose: () => void;
};

type Milestone = { kicker: string; title: string; body: string };
type Beat =
  | { kind: 'milestone'; data: Milestone }
  | { kind: 'recognition' }
  | { kind: 'consent' }
  | { kind: 'closing' };

/**
 * The Small Wins Story — a Wrapped-shaped moment that plays after a night is
 * sealed. It never captures anything (the seal already did that); it reflects
 * the win back, offers the one consented share, and — on nights 3 / 7 / 14 /
 * 21 — opens with a milestone beat. No scores, streaks, likes, or partner
 * identity ever appear. Reduced-motion drops every transition.
 */
export default function SmallWinsStory({ visible, night, win, onClose }: Props) {
  useLanguage(); // re-render when the language changes
  const [index, setIndex] = useState(0);
  const [branch, setBranch] = useState<'share' | 'private' | null>(null);
  const [width, setWidth] = useState(0);
  const [reduce, setReduce] = useState(false);
  const fade = useMemo(() => new Animated.Value(1), []);

  const beats = useMemo<Beat[]>(() => {
    const list: Beat[] = [];
    const ms = milestoneFor(night);
    if (ms) list.push({ kind: 'milestone', data: ms });
    list.push({ kind: 'recognition' });
    list.push({ kind: 'consent' });
    list.push({ kind: 'closing' });
    return list;
  }, [night]);

  // Reset from event handlers (onShow / close), never during render, so the
  // story always opens on the first beat without an effect scheduling a
  // cascading render.
  function reset() {
    setIndex(0);
    setBranch(null);
  }
  function handleClose() {
    reset();
    onClose();
  }

  // Honour the OS reduced-motion switch and follow live changes.
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (active) setReduce(v);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => {
      active = false;
      sub.remove();
    };
  }, []);

  // Cross-fade the card on every beat change unless motion is reduced.
  useEffect(() => {
    if (reduce) {
      fade.setValue(1);
      return;
    }
    fade.setValue(0);
    const anim = Animated.timing(fade, {
      toValue: 1,
      duration: 240,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [index, reduce, fade]);

  const last = beats.length - 1;
  const beat = beats[index];

  function goNext() {
    // Consent must be chosen, not tapped past.
    if (beat.kind === 'consent' && branch === null) return;
    if (index >= last) {
      handleClose();
      return;
    }
    setIndex(index + 1);
  }
  function goPrev() {
    if (index > 0) setIndex(index - 1);
  }
  function choose(kind: 'share' | 'private') {
    setBranch(kind);
    setIndex(index + 1); // consent is always second-to-last
  }

  function onTap(e: GestureResponderEvent) {
    if (width <= 0) return;
    if (e.nativeEvent.locationX < width * 0.32) goPrev();
    else goNext();
  }
  function onLayout(e: LayoutChangeEvent) {
    setWidth(e.nativeEvent.layout.width);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onShow={reset}
      onRequestClose={handleClose}
    >
      <Pressable style={styles.backdrop} onPress={onTap} accessibilityLabel="Small wins story">
        <View style={styles.frame} onLayout={onLayout}>
          {/* progress segments */}
          <View style={styles.progress}>
            {beats.map((_, i) => (
              <View key={i} style={styles.seg}>
                <View
                  style={[
                    styles.segFill,
                    i < index && styles.segDone,
                    i === index && styles.segNow,
                  ]}
                />
              </View>
            ))}
          </View>

          <Animated.View style={[styles.card, { opacity: fade }]}>
            {renderBeat(beat, { night, win, branch, choose })}
          </Animated.View>

          <View style={styles.footer}>
            {index === last ? (
              <PrimaryButton label={t('small_wins.close')} onPress={handleClose} block />
            ) : (
              <Text style={styles.hint}>{t('small_wins.tap_hint')}</Text>
            )}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

function milestoneFor(night: number): Milestone | null {
  const key =
    night === 1
      ? 'm1'
      : night === 3
        ? 'm3'
        : night === 7
          ? 'm7'
          : night === 14
            ? 'm14'
            : night === 20
              ? 'm20'
              : night === 21
                ? 'm21'
                : null;
  if (!key) return null;
  return {
    kicker: t(`small_wins.${key}_kicker`),
    title: t(`small_wins.${key}_title`),
    body: t(`small_wins.${key}_body`),
  };
}

function renderBeat(
  beat: Beat,
  ctx: {
    night: number;
    win: string;
    branch: 'share' | 'private' | null;
    choose: (kind: 'share' | 'private') => void;
  },
) {
  if (beat.kind === 'milestone') {
    return (
      <View style={styles.beat}>
        <Text style={styles.kicker}>{beat.data.kicker}</Text>
        <Text style={styles.title}>{beat.data.title}</Text>
        <Text style={styles.body}>{beat.data.body}</Text>
      </View>
    );
  }

  if (beat.kind === 'recognition') {
    return (
      <View style={styles.beat}>
        <Text style={styles.title}>{t('small_wins.recognition_title')}</Text>
        <View style={styles.orbitWrap}>
          <Orbit lit={Math.min(ctx.night, TOTAL)} />
        </View>
        <View style={styles.winCard}>
          <Text style={styles.winLabel}>{t('small_wins.tonights_win_label')}</Text>
          <Text style={styles.winText}>{ctx.win}</Text>
        </View>
      </View>
    );
  }

  if (beat.kind === 'consent') {
    return (
      <View style={styles.beat}>
        <Text style={styles.title}>{t('small_wins.consent_title')}</Text>
        <View style={styles.winCard}>
          <Text style={[styles.winLabel, styles.gold]}>{t('small_wins.your_win_label')}</Text>
          <Text style={styles.winText}>{ctx.win}</Text>
        </View>
        <Text style={styles.lock}>{t('small_wins.consent_lock')}</Text>
        <View style={styles.choices}>
          <PrimaryButton
            label={t('small_wins.share_cta')}
            onPress={() => ctx.choose('share')}
            block
          />
          <Pressable
            onPress={() => ctx.choose('private')}
            accessibilityRole="button"
            style={styles.ghost}
          >
            <Text style={styles.ghostLabel}>{t('small_wins.keep_cta')}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // closing
  const shared = ctx.branch !== 'private';
  return (
    <View style={styles.beat}>
      <Text style={styles.title}>
        {shared ? t('small_wins.shared_title') : t('small_wins.kept_title')}
      </Text>
      {shared ? (
        <View style={styles.reactCard}>
          <Text style={styles.reactText}>♥  {t('small_wins.reaction_label')}</Text>
        </View>
      ) : null}
      <Text style={styles.body}>
        {shared ? t('small_wins.shared_body') : t('small_wins.kept_body')}
      </Text>
    </View>
  );
}

/** A compact 21-night orbit: 13 outer + 8 inner nodes, gold up to `lit`. */
function Orbit({ lit }: { lit: number }) {
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const ro = size * 0.4;
  const ri = size * 0.23;
  const nodes: { x: number; y: number }[] = [];
  for (let i = 0; i < 13; i += 1) {
    const a = ((-90 + i * (360 / 13)) * Math.PI) / 180;
    nodes.push({ x: cx + ro * Math.cos(a), y: cy + ro * Math.sin(a) });
  }
  for (let i = 0; i < 8; i += 1) {
    const a = ((-90 + i * (360 / 8) + 22) * Math.PI) / 180;
    nodes.push({ x: cx + ri * Math.cos(a), y: cy + ri * Math.sin(a) });
  }
  const glow = lit - 1;
  return (
    <Svg width={size} height={size}>
      {nodes.map((n, i) => {
        if (i === glow) {
          return <Circle key={i} cx={n.x} cy={n.y} r={6} fill={brand.gold} />;
        }
        if (i < lit) {
          return <Circle key={i} cx={n.x} cy={n.y} r={4.4} fill={brand.gold} opacity={0.82} />;
        }
        return (
          <Circle
            key={i}
            cx={n.x}
            cy={n.y}
            r={4.4}
            fill="none"
            stroke={brand.inkFaint}
            strokeWidth={1.2}
            opacity={0.5}
          />
        );
      })}
      <SvgText
        x={cx}
        y={cy - 4}
        fill={brand.inkMid}
        fontSize={11}
        fontFamily={font.body}
        textAnchor="middle"
      >
        {t('small_wins.night_label')}
      </SvgText>
      <SvgText
        x={cx}
        y={cy + 20}
        fill={brand.ink}
        fontSize={30}
        fontFamily={font.display}
        textAnchor="middle"
      >
        {String(Math.min(lit, TOTAL))}
      </SvgText>
    </Svg>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: brand.void },
  frame: { flex: 1, paddingHorizontal: space.xl, paddingTop: space.xxl, paddingBottom: space.xl },
  progress: { flexDirection: 'row', gap: 5, marginBottom: space.xl },
  seg: {
    flex: 1,
    height: 3,
    borderRadius: 3,
    backgroundColor: brand.inkFaint,
    overflow: 'hidden',
  },
  segFill: { flex: 1, borderRadius: 3, backgroundColor: 'transparent' },
  segDone: { backgroundColor: brand.ink },
  segNow: { backgroundColor: brand.rose },
  card: { flex: 1, justifyContent: 'center' },
  footer: { minHeight: 52, justifyContent: 'center', alignItems: 'center' },
  hint: { ...type.bodySmall, color: brand.inkFaint },

  beat: { gap: space.lg, alignItems: 'flex-start' },
  kicker: { ...type.label, color: brand.inkMid, letterSpacing: 2.4, textTransform: 'uppercase' },
  title: { ...type.display, color: brand.ink },
  body: { ...type.body, color: brand.inkMid, maxWidth: 320 },
  gold: { color: brand.gold },

  orbitWrap: { alignSelf: 'center', marginVertical: space.sm },
  winCard: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: brand.line,
    borderRadius: radius.lg,
    paddingVertical: space.md,
    paddingHorizontal: space.md,
    gap: 3,
  },
  winLabel: {
    ...type.label,
    color: brand.inkFaint,
    fontSize: 10.5,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  winText: { ...type.bodyStrong, color: brand.ink, fontSize: 16 },
  lock: { ...type.bodySmall, color: brand.inkMid, maxWidth: 320 },

  reactCard: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: brand.line,
    borderRadius: radius.lg,
    padding: space.md,
  },
  reactText: { ...type.bodyStrong, color: brand.rose, fontSize: 16 },

  choices: { alignSelf: 'stretch', gap: space.sm, marginTop: space.xs },
  ghost: {
    borderWidth: 1,
    borderColor: brand.line,
    borderRadius: radius.md,
    paddingVertical: space.md,
    alignItems: 'center',
  },
  ghostLabel: { ...type.bodyStrong, color: brand.rose },
});
