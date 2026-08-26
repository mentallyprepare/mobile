export type NotificationMoment =
  | 'night_open'
  | 'partner_present'
  | 'gentle_return'
  | 'entry_unlocked'
  | 'milestone';

export type NotificationCopy = {
  title: string;
  body: string;
  route: '/rooms' | '/';
};

const COPY_BANK: Record<NotificationMoment, readonly NotificationCopy[]> = {
  night_open: [
    { title: 'your 9 PM plot twist.', body: 'one question just landed.', route: '/rooms' },
    { title: 'one thought. no TED Talk.', body: 'tonight is ready.', route: '/rooms' },
    { title: 'today had lore.', body: 'leave one piece of it here.', route: '/rooms' },
  ],
  partner_present: [
    { title: 'someone showed up.', body: 'your shared sky changed tonight.', route: '/rooms' },
    { title: 'plot moved. no spoilers.', body: 'there is a new presence in your room.', route: '/rooms' },
  ],
  gentle_return: [
    { title: 'bas, one line.', body: 'tonight does not need a full essay.', route: '/rooms' },
    { title: 'your room kept its place.', body: 'return when you are ready.', route: '/rooms' },
  ],
  entry_unlocked: [
    { title: 'the day turned.', body: 'something new is ready in your room.', route: '/rooms' },
    { title: 'new lore unlocked.', body: 'open it when you have a quiet minute.', route: '/rooms' },
  ],
  milestone: [
    { title: 'seven nights.', body: 'two people kept showing up.', route: '/' },
    { title: 'still here.', body: 'your shared sky has grown again.', route: '/' },
  ],
};

function stableIndex(seed: string, length: number): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % length;
}
/**
 * Selects only from reviewed copy. No private writing, partner identity,
 * location, or generated text can enter a notification payload.
 */
export function selectNotificationCopy(
  moment: NotificationMoment,
  seed: string,
): NotificationCopy {
  const choices = COPY_BANK[moment];
  return choices[stableIndex(`${moment}:${seed}`, choices.length)];
}

export function notificationCopyBank(): Readonly<Record<NotificationMoment, readonly NotificationCopy[]>> {
  return COPY_BANK;
}
