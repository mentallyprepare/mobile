// English is the authoritative shape. Every other language must define
// exactly this — missing keys are a compile error, not a runtime hole.

import type { StringsShape } from './types';

export const en: StringsShape = {
  support: {
    back: '← back',
    heading: 'SUPPORT',
    title: 'if tonight is heavy.',
    ifUnsafe:
      'If you feel unsafe right now, contact local emergency services, a trusted person, or a crisis helpline immediately.',
    india: 'India',
    us_canada: 'United States & Canada',
    uk_ireland_europe: 'United Kingdom, Ireland & Europe',
    anywhere_else: 'Anywhere else',
    call: 'call',
    text: 'text',
    open_link: 'open',
    directory_description: 'Verified helplines, listed by country.',
    what_this_is_title: 'what this is.',
    not_service:
      'Mentally Prepare is an anonymous writing and peer connection product for adults. It is not therapy, counselling, medical care, emergency support, or a crisis line.',
    human_review:
      'Your entries are private by default. No human reviews journal entries unless content is reported, legally required, or flagged for serious safety risk.',
  },
};
