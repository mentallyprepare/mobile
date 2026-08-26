import { Pressable, StyleSheet, Text, View } from 'react-native';
import { brand, radius, space, type } from '../../design';

export default function CommunityCard({ hasMatch, partnerPresent, onPress }: { hasMatch: boolean; partnerPresent: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Open community" style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.people}><View style={styles.person} /><View style={[styles.person, styles.personTwo]} /><View style={[styles.person, styles.personThree]} /></View>
      <Text style={styles.kicker}>COMMUNITY</Text>
      <Text style={styles.title}>{hasMatch ? (partnerPresent ? 'Someone is present in your circle.' : 'Your circle is quiet right now.') : 'Connection begins with consent.'}</Text>
      <Text style={styles.body}>{hasMatch ? 'See presence and shared-room actions without exposing anyone’s private writing.' : 'Learn how a real connection appears after your private setup is complete.'}</Text>
      <Text style={styles.action}>Open community →</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: space.lg, padding: space.lg, borderRadius: radius.xl, backgroundColor: 'rgba(137,108,181,0.12)', borderWidth: 1, borderColor: 'rgba(137,108,181,0.38)' }, people: { height: 48, flexDirection: 'row', alignItems: 'center' }, person: { width: 38, height: 38, borderRadius: 19, backgroundColor: brand.purple, borderWidth: 3, borderColor: brand.sky }, personTwo: { marginLeft: -10, backgroundColor: brand.rose }, personThree: { marginLeft: -10, backgroundColor: brand.gold }, kicker: { ...type.eyebrow, color: brand.purple, fontSize: 9, lineHeight: 12, marginTop: space.md }, title: { ...type.bodyStrong, color: brand.ink, fontSize: 19, lineHeight: 24, marginTop: space.xs }, body: { ...type.body, color: brand.inkMid, fontSize: 14, lineHeight: 20, marginTop: space.sm }, action: { ...type.bodyStrong, color: brand.rose, fontSize: 12, marginTop: space.lg }, pressed: { opacity: 0.76, transform: [{ scale: 0.99 }] },
});
