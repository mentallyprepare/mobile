import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { routeFromNotificationData } from './routing';
import { configureNotificationPresentation } from './registration';

export default function NotificationRouting() {
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS === 'web') return;

    void configureNotificationPresentation();

    const open = (response: Notifications.NotificationResponse | null) => {
      const route = routeFromNotificationData(
        response?.notification.request.content.data,
      );
      if (route) router.push(route);
    };

    void Notifications.getLastNotificationResponseAsync().then(open);
    const subscription = Notifications.addNotificationResponseReceivedListener(open);
    return () => subscription.remove();
  }, [router]);

  return null;
}
