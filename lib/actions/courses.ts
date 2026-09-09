"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getOrgContext } from "@/lib/auth/org-context";
import { createCourseSchema } from "@/lib/validations/course";

export type CreateCourseResult =
  | { ok: true; id: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export type CourseActionResult = { ok: true } | { ok: false; error: string };

/*
  Anything that changes the course list also changes the enquiry capture sheet's
  dropdown, which is rendered by the enquiry pages.
*/
function revalidateCourses() {
  revalidatePath("/courses");
  revalidatePath("/enquiries");
  revalidatePath("/enquiries/follow-ups");
}

/*
  Deliberately does not throw on invalid input. A server action that throws
  reaches the browser as an opaque digest in production, which is useless to
  someone filling in a form — the caller gets field errors instead.
*/
export async function createCourse(input: unknown): Promise<CreateCourseResult> {
  const { organizationId } = await getOrgContext();

  const parsed = createCourseSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && !fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Please check the form and try again.",
      fieldErrors,
    };
  }

  /*
    Two courses with the same name are indistinguishable in the enquiry
    dropdown, and picking the wrong one splits a course's enquiries across two
    rows that can never be reconciled. Checked case-insensitively — "Keyboard"
    and "keyboard" are the same course to the person typing it.
  */
  const clash = await prisma.course.findFirst({
    where: { organizationId, name: { equals: parsed.data.name, mode: "insensitive" } },
    select: { id: true, active: true },
  });
  if (clash) {
    const message = clash.active
      ? "A course with this name already exists."
      : "An archived course already has this name — restore it instead.";
    return { ok: false, error: message, fieldErrors: { name: message } };
  }

  const course = await prisma.course.create({
    data: {
      organizationId,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
    },
    select: { id: true },
  });

  revalidateCourses();
  return { ok: true, id: course.id };
}

/*
  Archive rather than delete. A course is referenced by batches and by every
  enquiry that named it, so removing the row would either fail on the foreign
  key or take real history with it. `active: false` keeps the record and only
  withdraws it from the pickers.
*/
export async function setCourseActive(
  id: string,
  active: boolean,
): Promise<CourseActionResult> {
  const { organizationId } = await getOrgContext();

  if (typeof id !== "string" || !id) return { ok: false, error: "Course not found." };

  // `updateMany` scoped to the organization is the tenant check —
  // `update({ where: { id } })` here would write across tenants.
  const { count } = await prisma.course.updateMany({
    where: { id, organizationId },
    data: { active: Boolean(active) },
  });
  if (count === 0) return { ok: false, error: "Course not found." };

  revalidateCourses();
  return { ok: true };
}
