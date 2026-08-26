export type NotificationPreferences = {
  enabled: boolean;
  morningReminder: boolean;
  eveningReminder: boolean;
  dailyReflection: boolean;
  streakReminder: boolean;
  silentRoomReminder: boolean;
};

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: true,
  morningReminder: false,
  eveningReminder: true,
  dailyReflection: true,
  streakReminder: true,
  silentRoomReminder: false,
};

export function cleanNotificationPreferences(
  input: Partial<NotificationPreferences> | null | undefined,
): NotificationPreferences {
  const enabled = input?.enabled !== false;
  return {
    enabled,
    morningReminder: enabled && input?.morningReminder === true,
    eveningReminder: enabled && input?.eveningReminder !== false,
    dailyReflection: enabled && input?.dailyReflection !== false,
    streakReminder: enabled && input?.streakReminder !== false,
    // Silent Room is no longer a current mobile product surface.
    silentRoomReminder: false,
  };
}
