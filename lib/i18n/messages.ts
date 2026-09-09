import type { Dictionary } from "@/lib/i18n/dictionaries/en";

/*
  Validation runs on the server, where there is no React context, and its
  messages have to survive the trip to a browser that may be reading in Tamil.
  So schemas and actions emit keys — "errors.phoneInvalid" — and the form that
  renders them looks the words up in the reader's dictionary.

  Anything that is not a known key is replaced by the generic "check the form"
  line rather than shown raw: an untranslated English sentence appearing under a
  Korean field label is worse than a vaguer sentence in Korean.
*/
const PREFIX = "errors.";

export type ErrorKey = keyof Dictionary["errors"];

export function errorKey(key: ErrorKey): string {
  return `${PREFIX}${key}`;
}

export function translateMessage(message: string | undefined, t: Dictionary): string {
  if (message?.startsWith(PREFIX)) {
    const key = message.slice(PREFIX.length) as ErrorKey;
    const translated = t.errors[key];
    if (translated) return translated;
  }
  return t.errors.checkForm;
}

export function translateFieldErrors(
  fieldErrors: Record<string, string> | undefined,
  t: Dictionary,
): Record<string, string> {
  if (!fieldErrors) return {};
  return Object.fromEntries(
    Object.entries(fieldErrors).map(([field, message]) => [field, translateMessage(message, t)]),
  );
}
