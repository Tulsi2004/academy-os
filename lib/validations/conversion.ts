import { z } from "zod";
import { errorKey } from "@/lib/i18n/messages";
import { ExperienceLevel } from "@/generated/prisma/enums";
import { phoneSchema } from "@/lib/validations/enquiry";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, errorKey("tooLong"))
    .transform((value) => value || undefined)
    .optional();

const optionalDate = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? new Date(value) : undefined))
  .refine((value) => !value || !Number.isNaN(value.getTime()), errorKey("dateInvalid"));

const optionalPhone = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined))
  .pipe(phoneSchema.optional());

const optionalEmail = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined))
  .pipe(z.string().email(errorKey("emailInvalid")).optional());

/*
  This is the one screen where the fuller details are justified — the person is
  actually enrolling, not walking past the desk. `organizationId` is absent here
  for the same reason it is absent everywhere else: it comes from the session.
*/
export const convertEnquirySchema = z.object({
  // Student
  firstName: z.string().trim().min(1, errorKey("firstNameRequired")).max(60, errorKey("tooLong")),
  lastName: optionalText(60),
  dateOfBirth: optionalDate,
  experience: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined))
    .pipe(z.enum(ExperienceLevel).optional()),
  address: optionalText(300),
  studentPhone: optionalPhone,
  studentEmail: optionalEmail,

  // Parent — a Parent row needs both, and the phone is what future lookups key on.
  parentName: z
    .string()
    .trim()
    .min(1, errorKey("parentNameRequired"))
    .max(100, errorKey("tooLong")),
  parentPhone: phoneSchema,
  parentEmail: optionalEmail,

  // Optional enrolment
  batchId: optionalText(64),

  /*
    Registration fee. CLAUDE.md: a Payment must have exactly one of studentId or
    enquiryId. Conversion always attaches to the new Student — the enquiryId
    route is for fees taken before a Student exists — so nothing here may set
    both, and the action never passes enquiryId.
  */
  registrationFee: z
    .string()
    .trim()
    .optional()
    // Blank and "0" both mean "no fee taken" — the field's own placeholder is
    // 0, so rejecting it would be a trap. Neither creates a Payment row.
    .transform((value) => {
      if (!value) return undefined;
      const amount = Number(value);
      return Number.isFinite(amount) && amount === 0 ? undefined : amount;
    })
    .refine(
      (value) => value === undefined || (Number.isFinite(value) && value > 0 && value < 10_000_000),
      errorKey("feeInvalid"),
    ),
});

export type ConvertEnquiryInput = z.input<typeof convertEnquirySchema>;
