import type { z } from "zod";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { translateMessage } from "@/lib/i18n/messages";

/*
  Runs the *same* schema the server action runs, in the browser, before the
  round trip. Two validators written separately drift within a release — one
  caps a note at 1000 characters and the other at 500 — and the person filling
  the form is the one who finds out. So there is one schema, imported by both.

  This never replaces the server check. The action re-validates everything on
  arrival, because a server action is a public endpoint and anything the browser
  says about its own input is a courtesy, not a guarantee.
*/
export function fieldErrorsOf(
  schema: z.ZodType,
  values: unknown,
  t: Dictionary,
): Record<string, string> {
  const parsed = schema.safeParse(values);
  if (parsed.success) return {};

  const errors: Record<string, string> = {};
  for (const issue of parsed.error.issues) {
    const field = issue.path[0];
    // First issue per field wins — a stack of three messages under one input is
    // noise, and the first is the one to fix.
    if (typeof field === "string" && !errors[field]) {
      errors[field] = translateMessage(issue.message, t);
    }
  }
  return errors;
}

/*
  Validates everything but surfaces only the field just left, so a half-filled
  form does not light up red the moment the first input loses focus.
*/
export function blurErrorFor(
  schema: z.ZodType,
  values: unknown,
  field: string,
  t: Dictionary,
): string {
  return fieldErrorsOf(schema, values, t)[field] ?? "";
}
