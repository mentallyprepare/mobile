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
