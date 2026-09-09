import { cookies } from "next/headers";
import { dictionaries } from "@/lib/i18n/dictionaries";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { DEFAULT_LOCALE, isLocaleCode, LOCALE_COOKIE, type LocaleCode } from "@/lib/i18n/locales";

/*
  How a server component gets the reader's language. The client half of the app
  reads the same cookie through LanguageProvider, so both halves of a page agree
  on the first paint — no English flashing before a swap.
*/
export async function getLocale(): Promise<LocaleCode> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocaleCode(value) ? value : DEFAULT_LOCALE;
}

export async function getDictionary(): Promise<{ locale: LocaleCode; t: Dictionary }> {
  const locale = await getLocale();
  return { locale, t: dictionaries[locale] };
}
