import { z } from "zod";
import { errorKey } from "@/lib/i18n/messages";

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
  A course is the syllabus the academy teaches — "Bharatanatyam", "Keyboard
  Grade 1". Two fields, because this is set up once and then mostly read: the
  specifics of when and with whom belong to a Batch, not here.

  `organizationId` is NOT in this schema and must never be. It comes from
  getOrgContext(). If it ever arrives from a form field, URL or header, that is
  a tenant-isolation hole.
*/
export const createCourseSchema = z.object({
  name: z.string().trim().min(1, errorKey("nameRequired")).max(100, errorKey("tooLong")),
  description: optionalText(500),
});

export type CreateCourseInput = z.input<typeof createCourseSchema>;
