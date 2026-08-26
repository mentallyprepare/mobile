/**
 * Fixed chrome the screens have to stay clear of.
 *
 * Pure, and free of react-native imports, so the arithmetic can be checked
 * without a device. The tab bar is absolutely positioned: nothing below it
 * reserves space automatically, so one shared constant is the only way the
 * bar's height and the screens' bottom padding stay in step.
 */
export const TAB_BAR_CONTENT_HEIGHT = 72;

/** The bar's real height on a device, including its gesture pill or nav bar. */
export function tabBarHeightFor(insetBottom: number | undefined): number {
  return TAB_BAR_CONTENT_HEIGHT + Math.max(0, insetBottom || 0);
}
