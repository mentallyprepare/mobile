// The one place a language key gets added. Every strings file must define
// the same shape — the compiler catches missing translations.

export type StringsShape = {
  support: {
    back: string;
    heading: string;
    title: string;
    ifUnsafe: string;
    india: string;
    us_canada: string;
    uk_ireland_europe: string;
    anywhere_else: string;
    call: string;
    text: string;
    open_link: string;
    directory_description: string;
    what_this_is_title: string;
    // Common footnote paragraphs shown on the support screen.
    not_service: string;
    human_review: string;
  };
  sign_in: {
    screen_label: string;
    title: string;
    sub: string;
    email_label: string;
    email_placeholder: string;
    email_a11y: string;
    password_label: string;
    password_a11y: string;
    forgot: string;
    forgot_a11y: string;
    submit: string;
    submit_busy: string;
    create_eyebrow: string;
    create_label: string;
    create_a11y: string;
    privacy_note: string;
    support_link: string;
    support_a11y: string;
    support_hint: string;
  };
  small_wins: {
    tap_hint: string;
    close: string;
    // recognition beat
    recognition_title: string;
    tonights_win_label: string;
    night_label: string;
    of_total: string;
    // consent beat
    consent_title: string;
    your_win_label: string;
    consent_lock: string;
    share_cta: string;
    keep_cta: string;
    // closing — shared
    shared_title: string;
    shared_body: string;
    reaction_label: string;
    // closing — kept private
    kept_title: string;
    kept_body: string;
    // milestone intros (nights 3 / 7 / 14 / 21)
    m3_kicker: string;
    m3_title: string;
    m3_body: string;
    m7_kicker: string;
    m7_title: string;
    m7_body: string;
    m14_kicker: string;
    m14_title: string;
    m14_body: string;
    m21_kicker: string;
    m21_title: string;
    m21_body: string;
  };
};

export type LanguageCode = 'en' | 'hi' | 'ta' | 'bn' | 'mr';

export const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  en: 'English',
  hi: 'हिन्दी',
  ta: 'தமிழ்',
  bn: 'বাংলা',
  mr: 'मराठी',
};

/** ISO codes the app knows how to render. Others fall back to English. */
export const SUPPORTED_LANGUAGES: readonly LanguageCode[] = ['en', 'hi', 'ta', 'bn', 'mr'];
