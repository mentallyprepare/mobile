import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { brand, radius, space, type } from '../../design';
import { failureDetail, failureHeadline, staleNotice } from '../../api/failures';

/**
 * What a screen shows when its data could not be fetched.
 *
 * Deliberately quiet: no red, no warning triangle, no exclamation. A failed
 * request is not an emergency, and the person reading this may already be
 * having a hard night. The one thing it always says is that nothing has been
 * removed.
 */
export function LoadFailure({
  error,
  onRetry,
  busy = false,
}: {
  error: unknown;
  onRetry: () => void;
  busy?: boolean;
}) {
  return (
    <View
      style={styles.panel}
      accessibilityLiveRegion="polite"
      accessible
      accessibilityLabel={`${failureHeadline(error)} ${failureDetail(error)}`}
    >
      <View style={styles.mark} />
      <Text style={styles.headline}>{failureHeadline(error)}</Text>
      <Text style={styles.detail}>{failureDetail(error)}</Text>
      <Pressable
        onPress={onRetry}
        disabled={busy}
        accessibilityRole="button"
        accessibilityLabel="Try again"
        accessibilityState={{ disabled: busy }}
        style={({ pressed }) => [
          styles.retry,
          busy && styles.retryBusy,
          pressed && styles.pressed,
        ]}
      >
        <Text style={styles.retryLabel}>{busy ? 'trying again…' : 'Try again'}</Text>
        {busy ? <ActivityIndicator color={brand.void} size="small" /> : null}
      </Pressable>
    </View>
  );
}

/**
 * The same message as a single line, for when real data is still on screen and
 * only the refresh failed. The content stays; this explains why it may be old.
 */
export function StaleNotice({
  error,
  onRetry,
  busy = false,
}: {
  error: unknown;
  onRetry: () => void;
  busy?: boolean;
}) {
  return (
    <View style={styles.notice} accessibilityLiveRegion="polite">
      <View style={styles.noticeDot} />
      <Text style={styles.noticeText}>{staleNotice(error)}</Text>
      <Pressable
        onPress={onRetry}
        disabled={busy}
        accessibilityRole="button"
        accessibilityLabel="Try refreshing again"
        accessibilityState={{ disabled: busy }}
        hitSlop={12}
        style={({ pressed }) => [styles.noticeRetry, pressed && styles.pressed]}
      >
        <Text style={styles.noticeRetryLabel}>{busy ? '…' : 'Retry'}</Text>
      </Pressable>
    </View>
  );
}

/** First load, nothing to show yet and nothing wrong. */
export function LoadPlaceholder({ label = 'Loading' }: { label?: string }) {
  return (
    <View style={styles.placeholder}>
      <ActivityIndicator
        color={brand.rose}
        accessibilityLabel={label}
        accessibilityRole="progressbar"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginTop: space.xl,
    padding: space.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: brand.line,
    backgroundColor: brand.card,
  },
  mark: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginBottom: space.lg,
    backgroundColor: brand.gold,
  },
  headline: {
    ...type.display,
    color: brand.ink,
    fontSize: 26,
    lineHeight: 31,
  },
  detail: {
    ...type.body,
    color: brand.inkMid,
    marginTop: space.sm,
  },
  retry: {
    minHeight: 48,
    marginTop: space.xl,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    backgroundColor: brand.rose,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
  retryBusy: { opacity: 0.7 },
  retryLabel: { ...type.bodyStrong, color: brand.void, fontSize: 15 },
  notice: {
    marginTop: space.lg,
    padding: space.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: brand.line,
    backgroundColor: brand.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  noticeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: brand.gold,
  },
  noticeText: { ...type.bodySmall, color: brand.inkMid, flex: 1, lineHeight: 18 },
  noticeRetry: { minHeight: 44, justifyContent: 'center', paddingHorizontal: space.sm },
  noticeRetryLabel: { ...type.bodyStrong, color: brand.rose, fontSize: 13 },
  placeholder: { marginTop: space.huge, alignItems: 'center' },
  pressed: { opacity: 0.78 },
});
