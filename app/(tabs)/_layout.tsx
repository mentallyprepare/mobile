import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { MeProvider } from '../../src/api/me-provider';
import { ShelfProvider } from '../../src/api/shelf-provider';
import { HomeIcon, DiscoverIcon, RoomsIcon, YouIcon } from '../../src/components/Icons';
import { daylight, radius, type } from '../../src/design';

/** Focused native surfaces. Discovery stays out of navigation until its real backend contract exists. */
function Shell() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: daylight.ink,
        tabBarInactiveTintColor: daylight.inkLow,
        sceneStyle: { backgroundColor: daylight.bg },
        tabBarLabelStyle: { ...type.eyebrow, fontSize: 10, letterSpacing: 0.6, textTransform: 'none' },
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color }) => <HomeIcon color={color} /> }} />
      <Tabs.Screen name="discover" options={{ href: null }} />
      <Tabs.Screen name="create" options={{ title: 'Shelf', tabBarIcon: ({ color }) => <DiscoverIcon color={color} /> }} />
      <Tabs.Screen name="rooms" options={{ title: 'Sky', tabBarIcon: ({ color }) => <RoomsIcon color={color} /> }} />
      <Tabs.Screen name="you" options={{ title: 'You', tabBarIcon: ({ color }) => <YouIcon color={color} /> }} />
    </Tabs>
  );
}

export default function TabsLayout() {
  return <MeProvider><ShelfProvider><Shell /></ShelfProvider></MeProvider>;
}

const styles = StyleSheet.create({
  tabBar: { position: 'absolute', left: 12, right: 12, bottom: 12, height: 76, paddingTop: 10, paddingBottom: 10, borderRadius: radius.xl, backgroundColor: daylight.surface, borderTopWidth: 0, borderWidth: 1, borderColor: daylight.border, shadowColor: '#25152E', shadowOpacity: 0.08, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
  tabItem: { paddingHorizontal: 2 },
});
