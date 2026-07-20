import { Tabs } from 'expo-router';
import { sky, ink, moon } from '../../src/theme';
import { MoonIcon, PulseIcon, SparkIcon, PersonIcon } from '../../src/components/Icons';

// The second route is now the real-data Inner Shelf; labels remain visually hidden.
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: moon.present,
        tabBarInactiveTintColor: ink.mid,
        sceneStyle: { backgroundColor: sky.late },
        tabBarStyle: {
          backgroundColor: '#0A0620',
          borderTopColor: ink.line,
          borderTopWidth: 1,
          height: 76,
          paddingTop: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ tabBarIcon: ({ color }) => <MoonIcon color={color} /> }}
      />
      <Tabs.Screen
        name="silent"
        options={{ tabBarIcon: ({ color }) => <PulseIcon color={color} /> }}
      />
      <Tabs.Screen
        name="sky"
        options={{ tabBarIcon: ({ color }) => <SparkIcon color={color} /> }}
      />
      <Tabs.Screen
        name="mirror"
        options={{ tabBarIcon: ({ color }) => <PersonIcon color={color} /> }}
      />
    </Tabs>
  );
}
