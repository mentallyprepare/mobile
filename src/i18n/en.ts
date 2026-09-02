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
  sign_in: {
    screen_label: 'PRIVATE 21-NIGHT RITUAL',
    title: 'welcome back.',
    sub: 'Return to the world you are building.',
    email_label: 'EMAIL',
    email_placeholder: 'you@college.edu',
    email_a11y: 'Email',
    password_label: 'PASSWORD',
    password_a11y: 'Password',
    forgot: 'forgot password?',
    forgot_a11y: 'Forgot password',
    submit: 'sign in',
    submit_busy: 'signing in…',
    create_eyebrow: 'NEW TO MENTALLY PREPARE?',
    create_label: 'create your account',
    create_a11y: 'Create account',
    privacy_note: '18+ · private by default · no public feed',
    support_link: 'if tonight is heavy, find support',
    support_a11y: 'Find support',
    support_hint: 'Crisis helplines by region',
  },
  reveal: {
    kicker: 'DAY 21',
    back_a11y: 'Back',
    not_yet_title: 'Reveal opens on the twenty-first night.',
    not_yet_body:
      "Come back after tonight's note is sealed on Night 21. Until then, the choice hasn't appeared yet.",
    choose_title: 'Choose what you want to share.',
    choose_body:
      'Both of you choose separately. If either one of you stays anonymous, neither identity crosses. Your choice locks after you submit.',
    choice_stay_anonymous_short: 'stay anonymous',
    choice_stay_anonymous_long:
      'Neither of you will see who the other was. The partnership stays private.',
    choice_first_name_short: 'share my first name',
    choice_first_name_long: 'Just your first name. Nothing else.',
    choice_name_college_short: 'share my name and college',
    choice_name_college_long:
      'Your full name, your college, and your year. No email.',
    choice_contact_details_short: 'share my contact details',
    choice_contact_details_long:
      'Your full name, college, year, and email — so you can find each other after.',
    waiting_title_prefix: 'You chose ',
    waiting_title_suffix: '.',
    waiting_body:
      'Waiting for the other person to make their choice. When they do, this screen updates on its own — or on your next visit.',
    waiting_locked: 'your choice is locked.',
    anonymous_title: 'This partnership stays private.',
    anonymous_body:
      'One of you chose to stay anonymous. Neither identity crosses. The twenty-one nights stay yours.',
    revealed_title: 'Say hi.',
    partner_card_label: 'YOUR PARTNER WAS',
    partner_email_a11y_prefix: 'Contact email ',
    unsent_letter_label: 'THE UNSENT LETTER',
    settling_title: 'Both of you have chosen.',
    settling_body:
      'The reveal is settling. This screen will update on your next visit.',
  },
  sign_up_explainer: {
    kicker: 'WHAT ANONYMOUS MEANS',
    title: 'a small, honest promise.',
    intro:
      'Before we ask for your name and email — here is what this app does and does not do with them.',
    promise1_title: 'Your name and email are never shown to another user.',
    promise1_body:
      'They live on your account for sign-in, password reset, and data export. No profile page displays them.',
    promise2_title: 'Your partner never sees who you are.',
    promise2_body:
      'For 21 nights, you both write anonymously. On Day 21 you both choose separately what to reveal — anywhere from staying anonymous to sharing contact details. If either of you picks anonymous, neither identity crosses.',
    promise3_title: 'College and year are used only to match you.',
    promise3_body:
      'They are not displayed on any profile. We avoid pairing you with someone from the same school unless you consent later.',
    promise4_title: 'You can delete everything at any time.',
    promise4_body:
      'Sign in, tap Safety & Privacy, tap Delete. Your account and every entry is removed from our servers.',
    footnote:
      'This app is for adults 18+. It is not therapy, medical care, or a crisis line — if you feel unsafe tonight, the Support screen has helplines by region.',
    continue: 'I understand — continue',
    not_now: 'not now',
  },
};
