/**
 * Crisis and support resources.
 *
 * Ported verbatim from the live safety page at mymentallyprepare.com/safety.
 * Nothing here is generated, inferred, or looked up at runtime: a wrong
 * helpline number is worse than no helpline number, so these are fixed,
 * reviewed values that change only when that page changes.
 *
 * Free of react-native imports so the list can be checked in plain Node.
 */

export type Helpline = {
  /** What the user calls it. */
  name: string;
  /** Dialable, in the form the user's region expects. */
  numbers: string[];
  /** Only when the source page states it. Never invented. */
  note?: string;
};

export type HelplineRegion = {
  region: string;
  helplines: Helpline[];
};

export const CRISIS_REGIONS: readonly HelplineRegion[] = [
  {
    region: 'India',
    helplines: [
      { name: 'Tele MANAS', numbers: ['14416', '1800 891 4416'] },
      { name: 'iCall', numbers: ['9152987821'] },
      { name: 'Vandrevala Foundation', numbers: ['+91 9999 666 555'] },
    ],
  },
  {
    region: 'United States & Canada',
    helplines: [
      {
        name: '988 Suicide & Crisis Lifeline',
        numbers: ['988'],
        note: 'call or text',
      },
    ],
  },
  {
    region: 'United Kingdom, Ireland & Europe',
    helplines: [
      { name: 'Samaritans (UK & IE)', numbers: ['116 123'], note: 'free, 24/7' },
      { name: 'EU emergency number', numbers: ['112'] },
    ],
  },
];

/** For anyone outside the regions above. */
export const HELPLINE_DIRECTORY = {
  label: 'findahelpline.com',
  url: 'https://findahelpline.com',
  description: 'Verified helplines, listed by country.',
};

/**
 * What this product is and is not.
 *
 * The wording matters and is taken from the safety page rather than rewritten.
 * A journaling app must never let someone believe it is watching over them.
 */
export const SUPPORT_STATEMENT = {
  notAService:
    'Mentally Prepare is an anonymous writing and peer connection product for adults. It is not therapy, counselling, medical care, emergency support, or a crisis line.',
  ifUnsafe:
    'If you feel unsafe right now, contact local emergency services, a trusted person, or a crisis helpline immediately.',
  humanReview:
    'Your entries are private by default. No human reviews journal entries unless content is reported, legally required, or flagged for serious safety risk.',
} as const;

/** Strips display spacing so a number can be handed to the dialer. */
export function dialable(number: string): string {
  return number.replace(/[^\d+]/g, '');
}

/** Every number on the page, flattened — used by the contract test. */
export function allHelplineNumbers(): string[] {
  return CRISIS_REGIONS.flatMap((region) =>
    region.helplines.flatMap((helpline) => helpline.numbers),
  );
}
