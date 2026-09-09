"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { dictionaries } from "@/lib/i18n/dictionaries";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import {
  intlLocale,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  type LocaleCode,
} from "@/lib/i18n/locales";

type LanguageContextValue = {
  locale: LocaleCode;
  /** BCP-47 tag for `Intl` — dates in the list are formatted with this. */
  intl: string;
  setLocale: (locale: LocaleCode) => void;
  t: Dictionary;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

/*
  Seeded from the server's cookie read rather than an effect, so the very first
  render is already in the right language. Switching writes the cookie itself
  (no server round-trip to change a preference) and then refreshes, which is
  what re-renders the server-rendered half of the page — the enquiry table, the
  detail panel — in the new language.

  `pending` only shadows the server's value for the moment between the click and
  the refresh landing, and is keyed to the locale it was chosen against. Once
  the server catches up, `pending.base` no longer matches and the prop takes
  over by derivation — no effect writing state back, and no stale choice
  surviving a back button.
*/
export function LanguageProvider({
  initialLocale,
  children,
}: {
  initialLocale: LocaleCode;
  children: ReactNode;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<{ base: LocaleCode; value: LocaleCode } | null>(null);

  const locale = pending && pending.base === initialLocale ? pending.value : initialLocale;

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      intl: intlLocale(locale),
      t: dictionaries[locale],
      setLocale(next: LocaleCode) {
        setPending({ base: initialLocale, value: next });
        document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
        router.refresh();
      },
    }),
    [locale, initialLocale, router],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside a LanguageProvider");
  return context;
}
