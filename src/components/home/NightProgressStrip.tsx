import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { brand, radius, space, type } from '../../design';
import { t } from '../../i18n';
import { useLanguage } from '../../i18n/react';

export default function NightProgressStrip({
  currentNight,
  completedNights,
  onSelectNight,
  onLockedPress,
}: {
  currentNight: number;
  completedNights: readonly number[];
  onSelectNight?: (night: number) => void;
  onLockedPress?: (night: number) => void;
}) {
  useLanguage();
  const completed = new Set(completedNights);
  return (
    <View
      style={styles.wrap}
      accessible
      accessibilityLabel={`${t('night_progress.a11y_prefix')}${currentNight}${t('night_progress.a11y_middle')}${completed.size}${t('night_progress.a11y_suffix')}`}
    >
      <View style={styles.headingRow}>
        <Text style={styles.heading}>{t('night_progress.heading')}</Text>
        <Text style={styles.count}>{String(currentNight).padStart(2, '0')} / 21</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {Array.from({ length: 21 }, (_, index) => {
          const night = index + 1;
          const isCurrent = night === currentNight;
          const isComplete = completed.has(night);
          const stateSuffix = isComplete
            ? t('night_progress.marker_a11y_completed_suffix')
            : isCurrent
              ? t('night_progress.marker_a11y_current_suffix')
              : t('night_progress.marker_a11y_locked_suffix');
          return (
            <Pressable
              key={night}
              onPress={() =>
                isComplete || isCurrent
                  ? onSelectNight?.(night)
                  : onLockedPress?.(night)
              }
              style={[styles.marker, isComplete && styles.complete, isCurrent && styles.current]}
              accessibilityRole="button"
              accessibilityLabel={`${t('night_progress.marker_a11y_prefix')}${night}${stateSuffix}`}
              accessibilityHint={
                isComplete || isCurrent
                  ? t('night_progress.marker_hint_open')
                  : t('night_progress.marker_hint_locked')
              }
            >
              <Text style={[styles.markerText, isComplete && styles.completeText]}>
                {String(night).padStart(2, '0')}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: space.xl },
  headingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heading: { ...type.eyebrow, fontSize: 8, color: brand.inkMid },
  count: { ...type.label, color: brand.ink },
  row: { gap: space.sm, paddingTop: space.md, paddingRight: space.xl },
  marker: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.card,
    borderWidth: 1,
    borderColor: brand.line,
  },
  complete: { backgroundColor: brand.rose, borderColor: brand.rose },
  current: { borderColor: brand.gold, borderWidth: 2 },
  markerText: { ...type.label, fontSize: 10, color: brand.inkMid },
  completeText: { color: brand.void },
});
