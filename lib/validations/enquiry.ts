import { z } from "zod";

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
const PHONE_MESSAGE = "Enter a 10-digit mobile number";

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
    .max(max)
    .transform((value) => value || undefined)
    .optional();

/*
  `organizationId` is NOT in this schema and must never be. It comes from
  getOrgContext(). If it ever arrives from a form field, URL or header, that is
  a tenant-isolation hole.
*/
export const createEnquirySchema = z.object({
  studentName: z.string().trim().min(1, "Student name is required").max(100),
  phone: phoneSchema,
  interestedIn: optionalText(100),
  courseId: optionalText(64),
  notes: optionalText(1000),
});

export type CreateEnquiryInput = z.input<typeof createEnquirySchema>;
