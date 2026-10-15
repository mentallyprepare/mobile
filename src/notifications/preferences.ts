export type NotificationPreferences = {
  enabled: boolean;
  emailReminders: boolean;
  morningReminder: boolean;
  eveningReminder: boolean;
  dailyReflection: boolean;
  streakReminder: boolean;
  silentRoomReminder: boolean;
};

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: true,
  emailReminders: false,
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
    emailReminders: input?.emailReminders === true,
    morningReminder: enabled && input?.morningReminder === true,
    eveningReminder: enabled && input?.eveningReminder !== false,
    dailyReflection: enabled && input?.dailyReflection !== false,
    streakReminder: enabled && input?.streakReminder !== false,
    // Silent Room is no longer a current mobile product surface.
    silentRoomReminder: false,
  };
}
