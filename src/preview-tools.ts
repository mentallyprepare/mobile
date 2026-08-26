/**
 * Whether the build may show design-preview surfaces.
 *
 * `app/daily-preview.tsx` renders a fully populated night — sealed entries, a
 * partner present, a filled shelf — so the design can be judged against real
 * density rather than the empty state a solo account sees before it is
 * matched. That is genuinely useful on an installed APK, and `__DEV__` alone
 * is false in one, so the screen was unreachable exactly where it was needed.
 *
 * The flag is set per EAS build profile. **It must never be set on the
 * production profile.** The content behind it is sample data, and the
 * governing rule is that this app never invents a partner, a note or a
 * connection in front of a real user. Every preview surface says so on screen.
 */
export const PREVIEW_TOOLS_ENABLED =
  __DEV__ || process.env.EXPO_PUBLIC_PREVIEW_TOOLS === '1';
