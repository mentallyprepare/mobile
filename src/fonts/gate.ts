/**
 * When the app is allowed to start drawing.
 *
 * The splash is held until the brand faces are ready. Reading `loaded` alone
 * means a font that fails, or one that simply never answers, holds the splash
 * for the life of the install: the app is bricked and there is nothing on
 * screen to say so.
 *
 * Pure, so the failure path can be tested without a device or a font.
 */

/**
 * How long the brand faces get before the app starts without them.
 *
 * Long enough that a normal cold start on a slow device still gets its real
 * typography, short enough that nobody sits looking at a splash screen
 * wondering whether the app is broken.
 */
export const FONT_GATE_TIMEOUT_MS = 4000;

export type FontGateInput = {
  loaded: boolean;
  error: unknown;
  /** True once FONT_GATE_TIMEOUT_MS has passed with no answer either way. */
  timedOut: boolean;
};

export type FontGateReason = 'waiting' | 'loaded' | 'error' | 'timeout';

export type FontGate = {
  /** May the app render? */
  ready: boolean;
  /** True when it is rendering in system faces rather than the brand ones. */
  usingFallback: boolean;
  reason: FontGateReason;
};

export function fontGate({ loaded, error, timedOut }: FontGateInput): FontGate {
  // A face that arrived is the only outcome that keeps the brand typography.
  if (loaded) return { ready: true, usingFallback: false, reason: 'loaded' };
  if (error) return { ready: true, usingFallback: true, reason: 'error' };
  if (timedOut) return { ready: true, usingFallback: true, reason: 'timeout' };
  return { ready: false, usingFallback: false, reason: 'waiting' };
}

/**
 * A one-line technical note for a font that did not arrive.
 *
 * Deliberately built from a fixed vocabulary plus the error's constructor name.
 * Nothing the user typed, and nothing from an error message, can reach it —
 * this is the app's only diagnostic output and it must stay incapable of
 * carrying private writing.
 */
export function fontFailureNote(reason: FontGateReason, error?: unknown): string | null {
  if (reason === 'error') {
    const kind =
      error && typeof error === 'object' && typeof (error as Error).name === 'string'
        ? (error as Error).name
        : 'Error';
    return `mentally-prepare: brand fonts failed to load (${kind}); continuing with system fonts`;
  }
  if (reason === 'timeout') {
    return `mentally-prepare: brand fonts did not load within ${FONT_GATE_TIMEOUT_MS}ms; continuing with system fonts`;
  }
  return null;
}
