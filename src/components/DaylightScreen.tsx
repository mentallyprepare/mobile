import { View, ScrollView, StyleSheet, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ReactNode } from 'react';
import { daylight, layout, space } from '../design';

type DaylightScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: ViewStyle;
};

/** The daylight world's page frame. Cream ground, centred column, safe-area
 *  top only (bottom is owned by the tab bar). */
export default function DaylightScreen({ children, scroll = true, contentStyle }: DaylightScreenProps) {
  const column = (
    <View style={[styles.column, contentStyle]}>{children}</View>
  );
  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {scroll ? (
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {column}
          </ScrollView>
        ) : (
          <View style={styles.scroll}>{column}</View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: daylight.bg },
  safe: { flex: 1 },
  scroll: { paddingBottom: space.huge, paddingTop: space.xl },
  column: {
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
    paddingHorizontal: layout.gutter,
  },
});
