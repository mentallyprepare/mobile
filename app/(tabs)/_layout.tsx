import { Tabs } from 'expo-router';
import { cosmos, font, ink, sky } from '../../src/theme';
import { MoonIcon, PulseIcon, SparkIcon, PersonIcon } from '../../src/components/Icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: cosmos.lilac,
        tabBarInactiveTintColor: ink.faint,
        tabBarHideOnKeyboard: true,
        sceneStyle: { backgroundColor: sky.late },
        tabBarLabelStyle: {
          marginTop: 3,
          fontFamily: font.bodyStrong,
          fontSize: 9,
          letterSpacing: 0.3,
        },
        tabBarItemStyle: { paddingTop: 8, paddingBottom: 7 },
        tabBarStyle: {
          backgroundColor: 'rgba(10,6,32,0.98)',
          borderTopColor: ink.line,
          borderTopWidth: 1,
          height: 82,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarAccessibilityLabel: 'Home', tabBarIcon: ({ color }) => <MoonIcon color={color} /> }}
      />
      <Tabs.Screen
        name="silent"
        options={{ title: 'Shelf', tabBarAccessibilityLabel: 'Inner Shelf', tabBarIcon: ({ color }) => <PulseIcon color={color} /> }}
      />
      <Tabs.Screen
        name="sky"
        options={{ title: 'Sky', tabBarAccessibilityLabel: 'Your sky', tabBarIcon: ({ color }) => <SparkIcon color={color} /> }}
      />
      <Tabs.Screen
        name="mirror"
        options={{ title: 'You', tabBarAccessibilityLabel: 'Your profile', tabBarIcon: ({ color }) => <PersonIcon color={color} /> }}
      />
    </Tabs>
  );
}
