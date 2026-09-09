import type { LocaleCode } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { en } from "@/lib/i18n/dictionaries/en";
import { hi } from "@/lib/i18n/dictionaries/hi";
import { mr } from "@/lib/i18n/dictionaries/mr";
import { ta } from "@/lib/i18n/dictionaries/ta";
import { es } from "@/lib/i18n/dictionaries/es";
import { ptBR } from "@/lib/i18n/dictionaries/pt-BR";
import { de } from "@/lib/i18n/dictionaries/de";
import { ja } from "@/lib/i18n/dictionaries/ja";
import { frCA } from "@/lib/i18n/dictionaries/fr-CA";
import { zhCN } from "@/lib/i18n/dictionaries/zh-CN";
import { ko } from "@/lib/i18n/dictionaries/ko";

/*
  Every locale is bundled rather than dynamically imported. The whole set is a
  few tens of kilobytes of text — smaller than one photo — and loading it up
  front is what lets the switcher change language with no request and no
  loading state.
*/
export const dictionaries: Record<LocaleCode, Dictionary> = {
  en,
  hi,
  mr,
  ta,
  es,
  "pt-BR": ptBR,
  de,
  ja,
  "fr-CA": frCA,
  "zh-CN": zhCN,
  ko,
};
