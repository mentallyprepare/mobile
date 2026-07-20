import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import {
  useFonts,
  InstrumentSerif_400Regular,
  InstrumentSerif_400Regular_Italic,
} from '@expo-google-fonts/instrument-serif';
import { Manrope_500Medium, Manrope_600SemiBold } from '@expo-google-fonts/manrope';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SessionProvider, useSession } from '../src/session';
import { sky } from '../src/theme';

SplashScreen.preventAutoHideAsync();

/**
 * Keeps the route in step with the session. Lives below the provider so it can
 * read it; redirects only once the session is known, so a cold start does not
 * flash the sign-in screen at someone who is already signed in.
 */
function RootNavigator() {
  const { signedIn } = useSession();
  const segments = useSegments();
  const router = useRouter();

  // Depend on the first segment as a *string*, not on the segments array:
  // useSegments() returns a fresh array each render, so keeping the array in
  // the dependency list re-fires this effect every render and re-triggers
  // navigation, which loops.
  const rootSegment = segments[0];

  useEffect(() => {
    if (signedIn === null) return;
    const onSignIn = rootSegment === 'sign-in';
    if (!signedIn && !onSignIn) router.replace('/sign-in');
    else if (signedIn && onSignIn) router.replace('/');
  }, [signedIn, rootSegment, router]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: sky.late },
      }}
    />
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    InstrumentSerif_400Regular,
    InstrumentSerif_400Regular_Italic,
    Manrope_500Medium,
    Manrope_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    // SafeAreaView needs this ancestor for correct insets.
    <SafeAreaProvider>
      <StatusBar style="light" />
      <SessionProvider>
        <RootNavigator />
      </SessionProvider>
    </SafeAreaProvider>
  );
}
