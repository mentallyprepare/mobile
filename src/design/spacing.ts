// Screens breathe. The directive's scale: 4, 8, 12, 16, 24, 32, 48, 64.

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  huge: 48,
  /** Added 25 Jul 2026. The air a single painted object needs around it. */
  giant: 64,
};

export const layout = {
  maxWidth: 420,
  gutter: 24,
};

// Radius moved to ./radius.ts in the 25 Jul token refactor. Re-exported here
// so existing `import { radius } from '../design'` call sites keep working.
export { radius } from './radius';
