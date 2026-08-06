import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import {
  registerNativePushToken,
  unregisterNativePushToken,
} from '../api/notifications';
import { secureStorage } from '../api/storage';

const NATIVE_PUSH_TOKEN_KEY = 'mp_native_push_token';

export type NotificationSetupFailure =
  | 'not_a_device'
  | 'permission_denied'
  | 'project_not_configured'
  | 'registration_failed';

export type NotificationSetupResult =
  | { ok: true; token: string }
  | { ok: false; reason: NotificationSetupFailure };

export async function configureNotificationPresentation(): Promise<void> {
  if (Platform.OS === 'web') return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('ritual', {
      name: 'Nightly ritual',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 180],
      lightColor: '#A89BF0',
      sound: null,
      enableVibrate: true,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PRIVATE,
    });
  }
}

function projectId(): string | null {
  return (
    Constants.easConfig?.projectId ??
    (Constants.expoConfig?.extra?.eas?.projectId as string | undefined) ??
    null
  );
}

export async function enableNativeNotifications(): Promise<NotificationSetupResult> {
  if (Platform.OS === 'web' || !Device.isDevice) {
    return { ok: false, reason: 'not_a_device' };
  }

  const easProjectId = projectId();
  if (!easProjectId) {
    return { ok: false, reason: 'project_not_configured' };
  }

  await configureNotificationPresentation();
  let permissions = await Notifications.getPermissionsAsync();
  if (permissions.status !== 'granted') {
    permissions = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: false,
        allowSound: false,
      },
    });
  }
  if (permissions.status !== 'granted') {
    return { ok: false, reason: 'permission_denied' };
  }

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({
      projectId: easProjectId,
    });
    await registerNativePushToken(token);
    await secureStorage.set(NATIVE_PUSH_TOKEN_KEY, token);
    return { ok: true, token };
  } catch {
    return { ok: false, reason: 'registration_failed' };
  }
}

export async function disableNativeNotificationsForThisDevice(): Promise<void> {
  const token = await secureStorage.get(NATIVE_PUSH_TOKEN_KEY);
  if (!token) return;
  await unregisterNativePushToken(token);
  await secureStorage.remove(NATIVE_PUSH_TOKEN_KEY);
}

export async function notificationPermissionStatus(): Promise<
  'granted' | 'denied' | 'undetermined' | 'unavailable'
> {
  if (Platform.OS === 'web' || !Device.isDevice) return 'unavailable';
  const permissions = await Notifications.getPermissionsAsync();
  if (permissions.status === 'granted') return 'granted';
  if (permissions.status === 'denied') return 'denied';
  return 'undetermined';
}
