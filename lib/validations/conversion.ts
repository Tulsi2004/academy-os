import { z } from "zod";
import { errorKey } from "@/lib/i18n/messages";
import { ExperienceLevel } from "@/generated/prisma/enums";
import { boundedDate, phoneSchema } from "@/lib/validations/enquiry";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, errorKey("tooLong"))
    .transform((value) => value || undefined)
    .optional();

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
  What it takes to put a person on the roll, however they got there: admitted
  from an enquiry, or typed in directly because they have been coming to class
  since before the academy had software. One schema, because the resulting
  Student and Parent rows are identical either way — only the paperwork behind
  them differs.

  `organizationId` is absent here for the same reason it is absent everywhere
  else: it comes from the session.
*/
export const studentIntakeSchema = z.object({
  // Student
  firstName: z.string().trim().min(1, errorKey("firstNameRequired")).max(60, errorKey("tooLong")),
  lastName: optionalText(60),
  // Nobody enrolling was born tomorrow, and nobody was born in 1830 — but the
  // window has to be a century wide, not the five years a follow-up gets.
  dateOfBirth: boundedDate({ allowFuture: false, withinYears: 120, rangeKey: "dateInvalid" }),
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

/*
  Conversion adds nothing to the intake beyond the enquiry it came from, and
  that arrives as a separate argument rather than a form field — a caller-
  supplied enquiry id in the body would be a tenancy hole.
*/
export const convertEnquirySchema = studentIntakeSchema;

/*
  Editing a student is the intake without the two fields that describe an event
  rather than a person: a batch enrolment and a registration fee are things that
  happened once, and re-submitting them on every edit would enrol the student
  twice and take the fee again.
*/
export const studentDetailsSchema = studentIntakeSchema.omit({
  batchId: true,
  registrationFee: true,
});

export type StudentIntakeInput = z.input<typeof studentIntakeSchema>;
export type StudentDetailsInput = z.input<typeof studentDetailsSchema>;
export type ConvertEnquiryInput = StudentIntakeInput;
