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
  reveal: {
    kicker: string;
    back_a11y: string;
    // State 1: reveal not yet available.
    not_yet_title: string;
    not_yet_body: string;
    // State 2: choose panel.
    choose_title: string;
    choose_body: string;
    // Reveal choice labels — mirrors REVEAL_LABELS in src/api/reveal.ts.
    choice_stay_anonymous_short: string;
    choice_stay_anonymous_long: string;
    choice_first_name_short: string;
    choice_first_name_long: string;
    choice_name_college_short: string;
    choice_name_college_long: string;
    choice_contact_details_short: string;
    choice_contact_details_long: string;
    // State 3: locked, waiting for partner.
    waiting_title_prefix: string; // "You chose "
    waiting_title_suffix: string; // "."
    waiting_body: string;
    waiting_locked: string;
    // State 4a: both chose stay_anonymous.
    anonymous_title: string;
    anonymous_body: string;
    // State 4b: both revealed.
    revealed_title: string;
    partner_card_label: string;
    partner_email_a11y_prefix: string; // "Contact email "
    unsent_letter_label: string;
    // Fallback branch.
    settling_title: string;
    settling_body: string;
  };
  sign_up_explainer: {
    kicker: string;
    title: string;
    intro: string;
    promise1_title: string;
    promise1_body: string;
    promise2_title: string;
    promise2_body: string;
    promise3_title: string;
    promise3_body: string;
    promise4_title: string;
    promise4_body: string;
    footnote: string;
    continue: string;
    not_now: string;
  };
  sign_up: {
    back: string;
    eyebrow_prefix: string; // "CREATE ACCOUNT · "
    eyebrow_suffix: string; // " OF 3"
    step1_title: string;
    step2_title: string;
    step3_title: string;
    step1_intro: string;
    step2_intro: string;
    step3_intro: string;
    name_label: string;
    name_placeholder: string;
    email_label: string;
    email_placeholder: string;
    password_label: string;
    password_placeholder: string;
    confirm_label: string;
    confirm_placeholder: string;
    college_label: string;
    college_placeholder: string;
    year_label: string;
    gender_label: string;
    match_gender_label: string;
    age_title: string;
    age_body: string;
    consent_title: string;
    consent_body: string;
    read_terms: string;
    read_privacy: string;
    account_exists_title: string;
    account_exists_body: string;
    continue: string;
    sign_in_instead: string;
    reset_password: string;
    use_different_email: string;
    creating: string;
    create_account: string;
    already_have: string;
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
