// Motion explains a transition or a state. It never decorates.
//
// Latency is atmosphere (governing rule 5): nothing model-computed animates in
// the user's way. These durations describe state changes the app already knows
// the answer to.

import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export const duration = {
  instant: 100,
  micro: 180,
  standard: 320,
  expressive: 460,
  /** Sealing, unsealing, reveal. The only durations allowed to be felt. */
  ritual: 900,
};

/**
 * Reduce Motion contract, per the directive:
 *   - fades replace slide, zoom and shared-element transitions
 *   - parallax is disabled
 *   - floating / looping animations do not run at all
 *   - springs tighten
 *   - every piece of information stays available without animation
 *
 * The last clause is the one that actually bites: if a state is only legible
 * because something moved, the screen is broken for a user who turned motion
 * off. Check that before adding any transition.
 */
export function reduceMotionDurations(reduced: boolean) {
  if (!reduced) return duration;
  return {
    instant: duration.instant,
    micro: duration.micro,
    standard: duration.micro,
    expressive: duration.micro,
    ritual: duration.standard,
  };
}

/** Tightened spring for Reduce Motion; the default is the expressive one. */
export const spring = {
  default: { damping: 18, stiffness: 160, mass: 1 },
  reduced: { damping: 30, stiffness: 260, mass: 1 },
};

/**
 * Live Reduce Motion state. Reads the OS setting and subscribes to changes,
 * so a user toggling it in Settings does not have to restart the app.
 */
export function useReduceMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let alive = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (alive) setReduced(value);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);

  return reduced;
}
