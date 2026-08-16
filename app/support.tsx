import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import DaylightScreen from '../src/components/DaylightScreen';
import {
  CRISIS_REGIONS,
  HELPLINE_DIRECTORY,
  SUPPORT_STATEMENT,
  dialable,
  type Helpline,
} from '../src/safety/support';
import { daylight, radius, space, type } from '../src/design';

/**
 * Support and crisis resources.
 *
 * A Utility surface, deliberately: no backdrop, no gradient, no animation, no
 * atmosphere. Someone reaching this screen needs a phone number and nothing
 * between them and it. Numbers come first; the explanation of what this
 * product is not comes after, because the person who needs a helpline should
 * not have to read a disclaimer to find one.
 */
export default function SupportScreen() {
  const router = useRouter();

  return (
    <DaylightScreen>
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Back"
        hitSlop={12}
        style={styles.back}
      >
        <Text style={styles.backLabel}>← back</Text>
      </Pressable>

      <Text style={styles.eyebrow} accessibilityRole="header">
        SUPPORT
      </Text>
      <Text style={styles.title}>if tonight is heavy.</Text>
      <Text style={styles.intro}>{SUPPORT_STATEMENT.ifUnsafe}</Text>

      {CRISIS_REGIONS.map((region) => (
        <View key={region.region} style={styles.block}>
          <Text style={styles.region} accessibilityRole="header">
            {region.region}
          </Text>
          <View style={styles.group}>
            {region.helplines.map((helpline) => (
              <HelplineRow key={helpline.name} helpline={helpline} />
            ))}
          </View>
        </View>
      ))}

      <View style={styles.block}>
        <Text style={styles.region} accessibilityRole="header">
          Anywhere else
        </Text>
        <Pressable
          onPress={() => void Linking.openURL(HELPLINE_DIRECTORY.url)}
          accessibilityRole="link"
          accessibilityLabel={`Open ${HELPLINE_DIRECTORY.label}`}
          accessibilityHint={HELPLINE_DIRECTORY.description}
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        >
          <View style={styles.rowCopy}>
            <Text style={styles.rowTitle}>{HELPLINE_DIRECTORY.label}</Text>
            <Text style={styles.rowDetail}>{HELPLINE_DIRECTORY.description}</Text>
          </View>
          <Text style={styles.arrow}>↗</Text>
        </Pressable>
      </View>

      <View style={styles.statement}>
        <Text style={styles.statementTitle}>what this is.</Text>
        <Text style={styles.statementBody}>{SUPPORT_STATEMENT.notAService}</Text>
        <Text style={styles.statementBody}>{SUPPORT_STATEMENT.humanReview}</Text>
      </View>
    </DaylightScreen>
  );
}

function HelplineRow({ helpline }: { helpline: Helpline }) {
  return (
    <View style={styles.helpline}>
      <Text style={styles.rowTitle}>{helpline.name}</Text>
      {helpline.note ? <Text style={styles.rowDetail}>{helpline.note}</Text> : null}
      <View style={styles.numbers}>
        {helpline.numbers.map((number) => (
          <Pressable
            key={number}
            onPress={() => void Linking.openURL(`tel:${dialable(number)}`)}
            accessibilityRole="button"
            accessibilityLabel={`Call ${helpline.name} on ${number}`}
            style={({ pressed }) => [styles.number, pressed && styles.pressed]}
          >
            <Text style={styles.numberText}>{number}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  back: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' },
  backLabel: { ...type.body, fontSize: 15, color: daylight.inkMid },
  eyebrow: {
    marginTop: space.lg,
    ...type.eyebrow,
    fontSize: 11,
    letterSpacing: 1.5,
    color: daylight.accent,
  },
  title: {
    marginTop: space.sm,
    ...type.displayItalic,
    fontSize: 36,
    lineHeight: 42,
    color: daylight.ink,
  },
  intro: { marginTop: space.md, ...type.body, lineHeight: 23, color: daylight.ink },
  block: { marginTop: space.xl },
  region: {
    ...type.bodyStrong,
    fontSize: 13,
    letterSpacing: 0.6,
    color: daylight.inkMid,
    marginBottom: space.sm,
  },
  group: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: daylight.border,
    backgroundColor: daylight.surface,
    overflow: 'hidden',
  },
  helpline: {
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: daylight.border,
  },
  numbers: { marginTop: space.sm, flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  number: {
    minHeight: 44,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: daylight.accent,
    justifyContent: 'center',
  },
  numberText: { ...type.bodyStrong, fontSize: 15, color: daylight.accent },
  row: {
    minHeight: 64,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  rowCopy: { flex: 1 },
  rowTitle: { ...type.bodyStrong, fontSize: 15, color: daylight.ink },
  rowDetail: { marginTop: 3, ...type.bodySmall, lineHeight: 18, color: daylight.inkMid },
  arrow: { ...type.body, fontSize: 18, color: daylight.inkMid },
  statement: {
    marginTop: space.xl,
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: daylight.border,
    gap: space.sm,
  },
  statementTitle: { ...type.bodyStrong, fontSize: 15, color: daylight.ink },
  statementBody: { ...type.bodySmall, lineHeight: 19, color: daylight.inkMid },
  pressed: { opacity: 0.7 },
});
