/**
 * The four states a provider-backed screen can actually be in.
 *
 * Kept as a pure function, separate from any component, because the bug this
 * exists to prevent is a rendering decision: a failed request must never be
 * drawn as an empty first-run state. That is a rule worth testing directly.
 */
export type LoadView =
  /** Nothing has arrived yet and nothing has failed. Show a placeholder. */
  | 'first-load'
  /** Nothing has ever arrived and the last attempt failed. Show the failure. */
  | 'failed'
  /** Something arrived once, and a later refresh failed. Show it, plus a note. */
  | 'stale'
  /** Current data, including a legitimately empty response. */
  | 'ready';

export type LoadInput = {
  loading: boolean;
  error: unknown;
  /** True once any response has been received successfully, ever. */
  hasLoaded: boolean;
};

export function describeLoad({ loading, error, hasLoaded }: LoadInput): LoadView {
  if (error && !hasLoaded) return 'failed';
  if (error) return 'stale';
  if (loading && !hasLoaded) return 'first-load';
  return 'ready';
}

/** True when the screen may draw its real content, empty or not. */
export function canRenderContent(view: LoadView): boolean {
  return view === 'ready' || view === 'stale';
}
