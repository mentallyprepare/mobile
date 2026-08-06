import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ReactNode, RefObject } from 'react';
import AppBackdrop from './AppBackdrop';
import { useTabBarHeight } from './tab-bar';
import { brand, layout, space } from '../../design';

export default function CosmicScreen({
  children,
  scroll = true,
  contentStyle,
  /**
   * Lifts the content above the keyboard. Off by default: only screens with a
   * real editor need it, and on the others it is one more thing that can move.
   */
  avoidKeyboard = false,
  scrollRef,
}: {
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: ViewStyle;
  avoidKeyboard?: boolean;
  scrollRef?: RefObject<ScrollView | null>;
}) {
  const tabBarHeight = useTabBarHeight();
  const content = <View style={[styles.column, contentStyle]}>{children}</View>;

  // Measured, not guessed: the bar's own height plus whatever the device
  // reserves underneath it, so the last control on a screen is never trapped.
  const clearance = { paddingBottom: tabBarHeight + space.xl };

  const body = scroll ? (
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={[styles.scroll, clearance]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      // iOS insets the scroll view itself; Android is handled by the
      // KeyboardAvoidingView below. Neither discards what has been typed.
      automaticallyAdjustKeyboardInsets={avoidKeyboard}
    >
      {content}
    </ScrollView>
  ) : (
    <View style={[styles.scroll, clearance]}>{content}</View>
  );

  return (
    <View style={styles.root}>
      <AppBackdrop />
      <SafeAreaView style={styles.safe} edges={['top']}>
        {avoidKeyboard ? (
          <KeyboardAvoidingView style={styles.flex} behavior="padding">
            {body}
          </KeyboardAvoidingView>
        ) : (
          body
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.void },
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: { paddingTop: space.lg },
  column: {
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
    paddingHorizontal: space.lg,
  },
});
