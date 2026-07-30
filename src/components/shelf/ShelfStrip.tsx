import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import ShelfCover from './ShelfCover';
import { SHELF_KINDS, type ShelfItem, type ShelfKind } from '../../api/shelf';
import { brand, space, type } from '../../design';

export default function ShelfStrip({
  byKind,
  title = 'Your shelf',
}: {
  byKind: Partial<Record<ShelfKind, ShelfItem>>;
  title?: string;
}) {
  const router = useRouter();

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Pressable
          onPress={() => router.push('/create')}
          accessibilityRole="button"
          accessibilityLabel="See your full shelf"
          style={({ pressed }) => pressed && styles.pressed}
        >
          <Text style={styles.seeAll}>See all</Text>
        </Pressable>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {SHELF_KINDS.map((kind, index) => (
          <ShelfCover
            key={kind}
            kind={kind}
            item={byKind[kind]}
            available
            index={index + 1}
            onPress={() =>
              router.push({ pathname: '/shelf/[kind]', params: { kind } })
            }
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: space.xl },
  header: {
    marginBottom: space.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { ...type.bodyStrong, color: brand.ink, fontSize: 17 },
  seeAll: { ...type.bodySmall, color: brand.rose },
  row: { gap: space.md, paddingRight: space.xl },
  pressed: { opacity: 0.65 },
});
