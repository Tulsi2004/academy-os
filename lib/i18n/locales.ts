/*
  The same eleven locales the marketing site offers, in the same order and with
  the same labels — someone who picked मराठी on academyos.com should find the
  identical switcher, spelled the identical way, once they are inside the
  product.
*/
export type LocaleCode =
  | "en"
  | "hi"
  | "mr"
  | "ta"
  | "es"
  | "pt-BR"
  | "de"
  | "ja"
  | "fr-CA"
  | "zh-CN"
  | "ko";

export const DEFAULT_LOCALE: LocaleCode = "en";

/*
  A cookie, not localStorage. Half of this product renders on the server — the
  enquiry list, the detail page, the follow-up queue — and a server component
  cannot read localStorage. Storing the choice in a cookie means the first paint
  is already in the reader's language instead of flashing English and swapping.
*/
export const LOCALE_COOKIE = "academy-os-locale";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export type LocaleDescriptor = {
  code: LocaleCode;
  /** Always written in the language itself — nobody looks for "Hindi" in a list. */
  label: string;
  flag: string;
  /** BCP-47 tag for Intl date and number formatting. */
  intl: string;
};

export const LOCALES: LocaleDescriptor[] = [
  { code: "en", label: "English (Global)", flag: "globe", intl: "en-IN" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳", intl: "hi-IN" },
  { code: "mr", label: "मराठी", flag: "🇮🇳", intl: "mr-IN" },
  { code: "ta", label: "தமிழ்", flag: "🇮🇳", intl: "ta-IN" },
  { code: "es", label: "Español", flag: "globe", intl: "es-ES" },
  { code: "pt-BR", label: "Português (Brasil)", flag: "🇧🇷", intl: "pt-BR" },
  { code: "de", label: "Deutsch", flag: "🇩🇪", intl: "de-DE" },
  { code: "ja", label: "日本語", flag: "🇯🇵", intl: "ja-JP" },
  { code: "fr-CA", label: "Français (Canada)", flag: "🇨🇦", intl: "fr-CA" },
  { code: "zh-CN", label: "简体中文", flag: "🇨🇳", intl: "zh-CN" },
  { code: "ko", label: "한국어", flag: "🇰🇷", intl: "ko-KR" },
];

export function isLocaleCode(value: string | null | undefined): value is LocaleCode {
  return Boolean(value) && LOCALES.some((locale) => locale.code === value);
}

export function localeDescriptor(code: LocaleCode): LocaleDescriptor {
  return LOCALES.find((locale) => locale.code === code) ?? LOCALES[0];
}

/** The tag to hand `Intl` for a given UI locale. */
export function intlLocale(code: LocaleCode): string {
  return localeDescriptor(code).intl;
}
