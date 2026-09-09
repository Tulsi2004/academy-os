"use client";

import { GlobeIcon } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-provider";
import { LOCALES, localeDescriptor, type LocaleCode } from "@/lib/i18n/locales";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/*
  Built on the same Select as every other dropdown in the product rather than a
  hand-rolled menu — keyboard navigation, focus handling and the popup layer all
  come along for free, and the switcher then behaves exactly like the controls
  next to it.
*/
export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <Select
      value={locale}
      onValueChange={(value) => setLocale(value as LocaleCode)}
      items={LOCALES.map((option) => ({ value: option.code, label: option.label }))}
    >
      <SelectTrigger
        size="sm"
        aria-label={t.languageSwitcher.change}
        title={t.languageSwitcher.label}
        className="gap-1.5 border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <GlobeIcon className="size-4" />
        <SelectValue>
          {(value: string | null) => (
            // The full label is a lot of pixels for a topbar; on a phone the
            // globe alone carries the meaning and the name is one tap away.
            <span className="hidden max-w-32 truncate sm:inline">
              {localeDescriptor((value as LocaleCode) ?? locale).label}
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent align="end" className="min-w-48">
        {LOCALES.map((option) => (
          <SelectItem key={option.code} value={option.code}>
            <span className="w-5 shrink-0 text-center" aria-hidden="true">
              {option.flag === "globe" ? <GlobeIcon className="size-4" /> : option.flag}
            </span>
            <span>{option.label}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
