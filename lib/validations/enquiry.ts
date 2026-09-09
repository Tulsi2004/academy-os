import { z } from "zod";
import { EnquiryStatus, ExperienceLevel } from "@/generated/prisma/enums";
import { errorKey, type ErrorKey } from "@/lib/i18n/messages";

/*
  The phone number is the key everything else is found by — duplicate detection,
  and eventually students, parents and payments. Inconsistent formatting breaks
  lookup later, so every number is reduced to bare national digits before it is
  validated or stored: "+91 98765 43210", "098765 43210" and "9876543210" all
  become "9876543210".
*/
export function normalizePhone(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  // Leading zeros come off first, so "0091 98765 43210" reduces the same way
  // "+91 98765 43210" does. The length guard keeps a genuine 10-digit number
  // that happens to start "91" intact.
  digits = digits.replace(/^0+/, "");
  if (digits.length > 10 && digits.startsWith("91")) digits = digits.slice(2);
  return digits.replace(/^0+/, "");
}

// Indian mobile numbers are 10 digits and start 6-9.
const INDIAN_MOBILE = /^[6-9]\d{9}$/;
/*
  Messages are dictionary keys, not sentences — validation runs on the server
  where there is no reader and no language yet. `translateMessage` turns them
  into words in the form that shows them. See lib/i18n/messages.ts.
*/
const PHONE_MESSAGE = errorKey("phoneInvalid");

export const phoneSchema = z
  .string()
  .transform(normalizePhone)
  .refine((value) => INDIAN_MOBILE.test(value), PHONE_MESSAGE);

export function isCompletePhone(raw: string): boolean {
  return INDIAN_MOBILE.test(normalizePhone(raw));
}

// FormData and empty inputs both hand us "", which should mean "not provided"
// rather than "provided, but blank".
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, errorKey("tooLong"))
    .transform((value) => value || undefined)
    .optional();

/*
  `organizationId` is NOT in this schema and must never be. It comes from
  getOrgContext(). If it ever arrives from a form field, URL or header, that is
  a tenant-isolation hole.
*/
export const createEnquirySchema = z.object({
  studentName: z
    .string()
    .trim()
    .min(1, errorKey("studentNameRequired"))
    .max(100, errorKey("tooLong")),
  phone: phoneSchema,
  interestedIn: optionalText(100),
  courseId: optionalText(64),
  notes: optionalText(1000),
});

export type CreateEnquiryInput = z.input<typeof createEnquirySchema>;


/*
  A date typed into a date input can be anything the browser lets through, and a
  server action is a public endpoint besides. `new Date("")` and `new Date("x")`
  both produce Invalid Date, which Prisma rejects far downstream as an opaque
  500 rather than as something the person filling the form can fix.
*/
const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export function boundedDate({
  allowFuture = true,
  withinYears = 5,
  rangeKey = "dateOutOfRange",
}: {
  allowFuture?: boolean;
  /*
    How far from today the date may sit. Five years suits a follow-up; a date of
    birth needs a century, and giving them the same window would have rejected
    every student older than five.
  */
  withinYears?: number;
  rangeKey?: ErrorKey;
} = {}) {
  return z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? new Date(value) : undefined))
    .refine((value) => !value || !Number.isNaN(value.getTime()), errorKey("dateInvalid"))
    .refine(
      (value) => allowFuture || !value || value.getTime() <= Date.now(),
      errorKey("dateFuture"),
    )
    /*
      Catches the typo that a validity check cannot: "20226" parses perfectly
      and then sits in the follow-up queue for eighteen thousand years. Five
      years each way is wider than any real follow-up or any living student's
      date of birth is short.
    */
    .refine(
      (value) => !value || Math.abs(value.getTime() - Date.now()) < withinYears * YEAR_MS,
      errorKey(rangeKey),
    );
}

/*
  Lives here rather than inline in the action so the browser can run the exact
  same rules before the round trip — see lib/validations/client.ts.
*/
export const updateEnquirySchema = z.object({
  status: z.enum(EnquiryStatus),
  followUpDate: boundedDate(),
  // A new entry for the timeline, not a replacement for what came before. The
  // cap matches the note on the capture sheet; without one this field accepted
  // a pasted novel.
  note: optionalText(1000),
});


export const optionalEmail = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined))
  .pipe(z.string().email(errorKey("emailInvalid")).optional());

/*
  Everything about an enquiry that is a fact about the person rather than a
  record of what we did about them. Status, call-back date and notes are edited
  on the enquiry page itself and are deliberately absent here — mixing "what we
  know" with "where it stands" is how a screen ends up doing neither well.

  The phone stays editable but stays required: it is the key every duplicate
  check and future lookup runs on.
*/
export const enquiryDetailsSchema = z.object({
  studentName: z
    .string()
    .trim()
    .min(1, errorKey("studentNameRequired"))
    .max(100, errorKey("tooLong")),
  phone: phoneSchema,
  email: optionalEmail,
  parentName: optionalText(100),
  interestedIn: optionalText(100),
  courseId: optionalText(64),
  experience: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined))
    .pipe(z.enum(ExperienceLevel).optional()),
});

export type EnquiryDetailsInput = z.input<typeof enquiryDetailsSchema>;
