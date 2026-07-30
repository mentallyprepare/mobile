import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { HomeIcon, RoomsIcon, SparkIcon, YouIcon } from '../../src/components/Icons';
import { brand, type } from '../../src/design';

function Shell() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: brand.rose,
        tabBarInactiveTintColor: brand.inkLow,
        sceneStyle: { backgroundColor: brand.void },
        tabBarLabelStyle: {
          ...type.eyebrow,
          fontSize: 8.5,
          letterSpacing: 0.2,
          textTransform: 'none',
        },
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: ({ color }) => <HomeIcon color={color} /> }}
      />
      <Tabs.Screen
        name="create"
        options={{ title: 'Shelf', tabBarIcon: ({ color }) => <SparkIcon color={color} /> }}
      />
      <Tabs.Screen
        name="rooms"
        options={{ title: 'Night', tabBarIcon: ({ color }) => <RoomsIcon color={color} /> }}
      />
      <Tabs.Screen
        name="discover"
        options={{ href: null }}
      />
      <Tabs.Screen
        name="you"
        options={{ title: 'You', tabBarIcon: ({ color }) => <YouIcon color={color} /> }}
      />
    </Tabs>
  );
}

export default function TabsLayout() {
  return <Shell />;
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 72,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: brand.card,
    borderTopWidth: 1,
    borderTopColor: brand.line,
    shadowColor: '#000000',
    shadowOpacity: 0.34,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -8 },
    elevation: 12,
  },
  tabItem: { paddingHorizontal: 0 },
});
