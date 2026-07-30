import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tabBarHeightFor } from '../../design/chrome';

export { TAB_BAR_CONTENT_HEIGHT, tabBarHeightFor } from '../../design/chrome';

/**
 * The height the tab bar occupies on this device, including the Android
 * gesture pill or software navigation bar. Previously the bar ignored the
 * inset entirely and the screens compensated with a hard-coded 132.
 */
export function useTabBarHeight(): number {
  const insets = useSafeAreaInsets();
  return tabBarHeightFor(insets.bottom);
}
