// Rematch cooldown copy — a small pure module so the safety screen can
// render an honest state read without inlining the ladder of conditions.
// Free of react-native, testable in plain Node.

import type { PartnerStatus } from '../api/types-me';

export type RematchStatus =
  | { kind: 'no-match'; short: string; long: string }
  | { kind: 'available'; short: string; long: string }
  | { kind: 'cooldown'; short: string; long: string; availableAt: string | null; daysRemaining: number | null }
  | { kind: 'exhausted'; short: string; long: string };

/**
 * The 5-day quiet window the server enforces before a switch becomes
 * available. Kept in sync with routes/app.js buildPartnerStatus.
 */
export const QUIET_WINDOW_DAYS = 5;

/**
 * Total switches allowed per matching cycle, per the server. When
 * switchesRemaining reaches 0 the button stays disabled for the whole cycle.
 */
export const SWITCHES_PER_CYCLE = 2;

/**
 * Turns partnerStatus into the exact copy the safety screen should show,
 * plus a machine-readable kind so callers can style the row. Never invents
 * a countdown from unset data — a missing daysSinceActive maps to
 * daysRemaining: null so the UI can say "soon" rather than "in NaN days".
 */
export function describeRematchAvailability(status: PartnerStatus | null | undefined): RematchStatus {
  if (!status || !status.hasPartner) {
    return {
      kind: 'no-match',
      short: 'No active match',
      long: 'Switch appears once you are paired.',
    };
  }
  if (status.switchesRemaining <= 0) {
    return {
      kind: 'exhausted',
      short: 'No switches remaining',
      long: `You have already changed partners the maximum ${SWITCHES_PER_CYCLE} times this cycle. You can keep writing privately.`,
    };
  }
  if (status.canSwitch) {
    return {
      kind: 'available',
      short: 'Available now',
      long: `${status.switchesRemaining} switch${status.switchesRemaining === 1 ? '' : 'es'} remaining this cycle.`,
    };
  }
  // Cooldown: figure out days remaining if we can. daysSinceActive counts up
  // from 0; we need QUIET_WINDOW_DAYS of quiet before a switch opens.
  const daysRemaining =
    status.daysSinceActive === null
      ? null
      : Math.max(0, QUIET_WINDOW_DAYS - status.daysSinceActive);
  const long =
    daysRemaining === null
      ? `Available after ${QUIET_WINDOW_DAYS} days without partner activity. ${status.switchesRemaining} switch${status.switchesRemaining === 1 ? '' : 'es'} remaining.`
      : daysRemaining <= 0
        ? `Available now. ${status.switchesRemaining} switch${status.switchesRemaining === 1 ? '' : 'es'} remaining.`
        : `Available in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'} if the current partner stays quiet. ${status.switchesRemaining} switch${status.switchesRemaining === 1 ? '' : 'es'} remaining.`;
  const short =
    daysRemaining === null
      ? 'Not yet available'
      : daysRemaining <= 0
        ? 'Available now'
        : `Available in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`;
  return {
    kind: 'cooldown',
    short,
    long,
    availableAt: status.nextSwitchAvailableAt,
    daysRemaining,
  };
}
