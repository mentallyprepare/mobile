import { brand } from './design';

export type RitualPhaseTheme = {
  background: [string, string];
  active: string;
  current: string;
  label: string;
};

export function ritualPhaseTheme(night: number): RitualPhaseTheme {
  if (night <= 7) {
    return {
      background: ['#3A2330', brand.sky],
      active: brand.rose,
      current: brand.gold,
      label: 'The Descent',
    };
  }
  if (night <= 14) {
    return {
      background: ['#3A2B52', brand.sky],
      active: brand.purple,
      current: brand.rose,
      label: 'The Depth',
    };
  }
  return {
    background: ['#584828', brand.sky],
    active: brand.gold,
    current: brand.rose,
    label: 'The Return',
  };
}
