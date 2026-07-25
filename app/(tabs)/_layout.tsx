import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { MeProvider } from '../../src/api/me-provider';
import { ShelfProvider } from '../../src/api/shelf-provider';
import {
  HomeIcon,
  DiscoverIcon,
  CreateIcon,
  RoomsIcon,
  YouIcon,
} from '../../src/components/Icons';
import { daylight, radius, type } from '../../src/design';

/**
 * Primary navigation: five tabs, sentence case, always with a visible text
 * label beside the icon. Set 25 Jul 2026 by the all-dark amendment
 * (docs/directive-native-social-app.md, ledger item 9).
 *
 * Route-to-label map, corrected in this pass — the three names had drifted
 * apart from the two things they describe:
 *   index    → Home
 *   discover → Discover   (was hidden behind href:null)
 *   create   → Create     (was labelled "Shelf")
 *   rooms    → Rooms      (was labelled "Sky"; it holds the Room interior,
 *                          i.e. the old Tonight ritual, which is where the
 *                          directive puts it)
 *   you      → You
 *
 * Discover has no backend contract yet and renders a truthful unavailable
 * state. It is visible anyway: the tab shows the shape of the product without
 * inventing anything to fill it. See docs/api-gaps.md.
 *
 * The tab bar's SKIN is still Daylight cream. That is deliberate and
 * temporary — it retints together with the five screens, in one coherent
 * slice. A dark tab bar under cream screens is a broken app, not a partial
 * one.
 */
function Shell() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: daylight.ink,
        tabBarInactiveTintColor: daylight.inkLow,
        sceneStyle: { backgroundColor: daylight.bg },
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: ({ color }) => <HomeIcon color={color} /> }}
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
        options={{ title: 'Create', tabBarIcon: ({ color }) => <CreateIcon color={color} /> }}
      />
      <Tabs.Screen
        name="rooms"
        options={{ title: 'Rooms', tabBarIcon: ({ color }) => <RoomsIcon color={color} /> }}
      />
      <Tabs.Screen
        name="you"
        options={{ title: 'You', tabBarIcon: ({ color }) => <YouIcon color={color} /> }}
      />
    </Tabs>
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
  // eyebrowMicro is tab-bar chrome only. It is below the 12px ritual floor by
  // design: this is navigation the user reads by shape and position. It is
  // not permitted inside a Room. See src/design/typography.ts.
  tabLabel: { ...type.eyebrowMicro, textTransform: 'none' },
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
});
