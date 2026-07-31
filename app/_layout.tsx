import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import {
  useFonts,
  InstrumentSerif_400Regular,
  InstrumentSerif_400Regular_Italic,
} from '@expo-google-fonts/instrument-serif';
import { Manrope_500Medium, Manrope_600SemiBold } from '@expo-google-fonts/manrope';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SessionProvider, useSession } from '../src/session';
import { MeProvider } from '../src/api/me-provider';
import { ShelfProvider } from '../src/api/shelf-provider';
import NotificationRouting from '../src/notifications/NotificationRouting';
import { sky } from '../src/theme';
import { brand } from '../src/design';
import { FONT_GATE_TIMEOUT_MS, fontFailureNote, fontGate } from '../src/fonts/gate';

void SplashScreen.preventAutoHideAsync().catch(() => {
  // Expo can reject when another runtime already owns the splash lifecycle.
  // Rendering must still continue with the normal font readiness gate.
});

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
    const onPublicAuthScreen =
      onSignIn || rootSegment === 'forgot-password' || rootSegment === 'sign-up';
    if (!signedIn && !onPublicAuthScreen) router.replace('/sign-in');
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
  const [fontsLoaded, fontError] = useFonts({
    InstrumentSerif_400Regular,
    InstrumentSerif_400Regular_Italic,
    Manrope_500Medium,
    Manrope_600SemiBold,
  });

  // useFonts reports success and failure, but a request that simply never
  // answers reports neither, and the splash is held on `loaded` alone. This is
  // the bound: after it, the app starts in system faces rather than not at all.
  const [fontsTimedOut, setFontsTimedOut] = useState(false);
  useEffect(() => {
    if (fontsLoaded || fontError) return;
    const handle = setTimeout(() => setFontsTimedOut(true), FONT_GATE_TIMEOUT_MS);
    return () => clearTimeout(handle);
  }, [fontsLoaded, fontError]);

  const gate = fontGate({
    loaded: fontsLoaded,
    error: fontError,
    timedOut: fontsTimedOut,
  });
  const fontsReady = gate.ready;

  // Recorded once, and built from a fixed vocabulary: this is the app's only
  // diagnostic output and it must stay incapable of carrying private writing.
  const noted = useRef(false);
  useEffect(() => {
    if (!gate.usingFallback || noted.current) return;
    noted.current = true;
    const note = fontFailureNote(gate.reason, fontError);
    if (note) console.warn(note);
  }, [gate.usingFallback, gate.reason, fontError]);

  useEffect(() => {
    if (!fontsReady) return;
    void SplashScreen.hideAsync().catch(() => {
      // A failed hide must not strand the app behind the native splash.
    });
  }, [fontsReady]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const style = document.createElement('style');
    style.id = 'mentally-prepare-web-autofill-theme';
    style.textContent = `
      input:-webkit-autofill,
      input:-webkit-autofill:hover,
      input:-webkit-autofill:focus,
      input:-webkit-autofill:active {
        -webkit-box-shadow: 0 0 0 1000px ${brand.card} inset !important;
        -webkit-text-fill-color: ${brand.ink} !important;
        caret-color: ${brand.ink} !important;
        transition: background-color 9999s ease-out 0s;
      }
    `;
    document.head.appendChild(style);

    return () => style.remove();
  }, []);

  if (!fontsReady) return null;

  return (
    // SafeAreaView needs this ancestor for correct insets.
    <SafeAreaProvider>
      <StatusBar style="light" />
      <SessionProvider>
        <MeProvider>
          <ShelfProvider>
            <NotificationRouting />
            <RootNavigator />
          </ShelfProvider>
        </MeProvider>
      </SessionProvider>
    </SafeAreaProvider>
  );
}
