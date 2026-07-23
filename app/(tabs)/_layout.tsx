import { Tabs, useRouter } from 'expo-router';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MeProvider, useMeShared } from '../../src/api/me-provider';
import { ShelfProvider } from '../../src/api/shelf-provider';
import {
  HomeIcon,
  DiscoverIcon,
  CreateIcon,
  RoomsIcon,
  YouIcon,
} from '../../src/components/Icons';
import { daylight, radius, space, type } from '../../src/design';

// Five tabs, EQUALS-shaped: visible labels, a raised center Create. See
// docs/design-daylight-world.md.
function Shell() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: daylight.ink,
        tabBarInactiveTintColor: daylight.inkLow,
        sceneStyle: { backgroundColor: daylight.bg },
        tabBarLabelStyle: {
          ...type.eyebrow,
          fontSize: 10,
          letterSpacing: 0.6,
          textTransform: 'none',
        },
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color }) => <DiscoverIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: '',
          tabBarLabel: () => null,
          tabBarButton: CreateTabButton,
        }}
      />
      <Tabs.Screen
        name="rooms"
        options={{
          title: 'Rooms',
          tabBarIcon: ({ color }) => <RoomsIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="you"
        options={{
          title: 'You',
          tabBarIcon: ({ color }) => <YouIcon color={color} />,
        }}
      />
    </Tabs>
  );
}

/**
 * Contextual center button. The label + destination change with state:
 * "Write tonight" when a Room is active, "Add to shelf" otherwise.
 * Also carries the raised-disc visual — the EQUALS-shape.
 */
function CreateTabButton({ style: _style }: any) {
  const { data } = useMeShared();
  const router = useRouter();
  const inRoom = !!data?.match;
  const label = inRoom ? 'Write tonight' : 'Add to shelf';

  return (
    <View style={styles.createSlot}>
      <Pressable
        onPress={() => router.push(inRoom ? '/rooms' : '/create')}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={
          inRoom ? 'Opens tonight\'s writing' : 'Opens shelf, if available'
        }
        style={({ pressed }) => [styles.createDisc, pressed && styles.pressed]}
      >
        <CreateIcon color={daylight.surface} size={24} />
      </Pressable>
      <Text style={styles.createLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <MeProvider>
      <ShelfProvider>
        <Shell />
      </ShelfProvider>
    </MeProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    height: 76,
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: radius.xl,
    backgroundColor: daylight.surface,
    borderTopWidth: 0,
    borderWidth: 1,
    borderColor: daylight.border,
    shadowColor: '#25152E',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  tabItem: { paddingHorizontal: 2 },

  createSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 2,
  },
  createDisc: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: daylight.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: daylight.accent,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    marginTop: -12,
  },
  pressed: { opacity: 0.85 },
  createLabel: {
    ...type.eyebrow,
    fontSize: 10,
    letterSpacing: 0.6,
    textTransform: 'none',
    color: daylight.ink,
    marginTop: 4,
    maxWidth: space.huge + 20,
    textAlign: 'center',
  },
});

// Give screens breathing room so the floating tab bar doesn't cover content.
// Screens compose DaylightScreen which pads paddingBottom: space.huge — that
// keeps the last row above the 76+12 bar.
