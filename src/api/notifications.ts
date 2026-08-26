import { Platform } from 'react-native';
import { api } from './index';
import {
  cleanNotificationPreferences,
  type NotificationPreferences,
} from '../notifications/preferences';

type PushSettingsResponse = {
  preferences?: Partial<NotificationPreferences>;
  subscribed?: boolean;
  nativeSubscribed?: boolean;
};

export async function getNotificationSettings(): Promise<{
  preferences: NotificationPreferences;
  subscribed: boolean;
}> {
  const result = await api.request<PushSettingsResponse>('/api/push/preferences');
  return {
    preferences: cleanNotificationPreferences(result.preferences),
    subscribed: result.nativeSubscribed ?? result.subscribed ?? false,
  };
}

export async function saveNotificationSettings(
  preferences: NotificationPreferences,
): Promise<NotificationPreferences> {
  const result = await api.request<{ preferences?: Partial<NotificationPreferences> }>(
    '/api/push/preferences',
    {
      method: 'POST',
      body: JSON.stringify({ preferences }),
    },
  );
  return cleanNotificationPreferences(result.preferences ?? preferences);
}

export async function registerNativePushToken(token: string): Promise<void> {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
  await api.request('/api/push/native/subscribe', {
    method: 'POST',
    body: JSON.stringify({
      token,
      platform: Platform.OS,
      timezone,
    }),
  });
}

export async function unregisterNativePushToken(token: string): Promise<void> {
  await api.request('/api/push/native/unsubscribe', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}
