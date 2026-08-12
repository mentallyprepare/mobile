import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { brand, radius, space, type } from '../../design';

export default function NightProgressStrip({
  currentNight,
  completedNights,
}: {
  currentNight: number;
  completedNights: readonly number[];
}) {
  const completed = new Set(completedNights);
  return (
    <View
      style={styles.wrap}
      accessible
      accessibilityLabel={`Night ${currentNight} of 21. ${completed.size} nights sealed.`}
    >
      <View style={styles.headingRow}>
        <Text style={styles.heading}>YOUR 21 NIGHTS</Text>
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
          return (
            <View
              key={night}
              style={[styles.marker, isComplete && styles.complete, isCurrent && styles.current]}
              accessibilityElementsHidden
            >
              <Text style={[styles.markerText, isComplete && styles.completeText]}>
                {String(night).padStart(2, '0')}
              </Text>
            </View>
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
