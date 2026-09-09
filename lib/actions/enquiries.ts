"use server";

import { revalidatePath } from "next/cache";
import { errorKey } from "@/lib/i18n/messages";
import { EnquiryStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { getOrgContext } from "@/lib/auth/org-context";
import {
  createEnquirySchema,
  isCompletePhone,
  normalizePhone,
  updateEnquirySchema,
} from "@/lib/validations/enquiry";

/*
  `error` carries a dictionary key ("errors.checkForm"), not a sentence — the
  form that renders it resolves it against the reader's language. See
  lib/i18n/messages.ts.
*/
export type EnquiryActionState = {
  error?: string;
  success?: boolean;
};

export type CreateEnquiryResult =
  | { ok: true; id: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

/*
  Deliberately does not throw on invalid input. A server action that throws
  reaches the browser as an opaque digest in production, which is useless to
  someone filling in a form — the caller gets field errors instead.
*/
export async function createEnquiry(input: unknown): Promise<CreateEnquiryResult> {
  const { organizationId, userId } = await getOrgContext();

  const parsed = createEnquirySchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && !fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? errorKey("checkForm"),
      fieldErrors,
    };
  }

  const { notes, courseId, ...fields } = parsed.data;

  /*
    `courseId` arrives from the capture sheet's dropdown, so it is caller-
    supplied and must be proved to belong to this organization. Without the
    check, a foreign id reaches the composite foreign key and fails as an opaque
    500 rather than a message anyone can act on.
  */
  if (courseId) {
    const course = await prisma.course.findFirst({
      where: { id: courseId, organizationId },
      select: { id: true },
    });
    if (!course) {
      return {
        ok: false,
        error: errorKey("courseGone"),
        fieldErrors: { courseId: errorKey("courseGone") },
      };
    }
  }

  // One transaction so an enquiry never lands without the note that was typed
  // alongside it.
  const enquiry = await prisma.$transaction(async (tx) => {
    const created = await tx.enquiry.create({
      data: { ...fields, courseId: courseId ?? null, organizationId, status: "NEW" },
    });
    if (notes) {
      await tx.enquiryNote.create({
        data: { organizationId, enquiryId: created.id, authorId: userId, body: notes },
      });
    }
    return created;
  });

  revalidatePath("/enquiries");
  revalidatePath("/enquiries/follow-ups");

  return { ok: true, id: enquiry.id };
}

export type PhoneMatch = {
  kind: "enquiry" | "parent";
  id: string;
  name: string;
  status: EnquiryStatus | null;
  daysAgo: number;
};

function daysSince(date: Date): number {
  const day = 86_400_000;
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.max(0, Math.round((startOfDay(new Date()) - startOfDay(date)) / day));
}

/*
  Powers the inline duplicate warning on the capture sheet. Impossible on paper,
  cheap here, and the beginning of phone-number-as-universal-key across the
  product. Scoped to the caller's organization like every other read.
*/
export async function findByPhone(rawPhone: string): Promise<PhoneMatch | null> {
  const { organizationId } = await getOrgContext();

  if (typeof rawPhone !== "string" || !isCompletePhone(rawPhone)) return null;
  const phone = normalizePhone(rawPhone);

  const enquiry = await prisma.enquiry.findFirst({
    where: { organizationId, phone },
    orderBy: { createdAt: "desc" },
    select: { id: true, studentName: true, status: true, createdAt: true },
  });
  if (enquiry) {
    return {
      kind: "enquiry",
      id: enquiry.id,
      name: enquiry.studentName,
      status: enquiry.status,
      daysAgo: daysSince(enquiry.createdAt),
    };
  }

  const parent = await prisma.parent.findFirst({
    where: { organizationId, phone },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, createdAt: true },
  });
  if (parent) {
    return {
      kind: "parent",
      id: parent.id,
      name: parent.name,
      status: null,
      daysAgo: daysSince(parent.createdAt),
    };
  }

  return null;
}

export async function updateEnquiry(
  id: string,
  _prevState: EnquiryActionState,
  formData: FormData,
): Promise<EnquiryActionState> {
  const parsed = updateEnquirySchema.safeParse({
    status: formData.get("status"),
    followUpDate: formData.get("followUpDate"),
    note: formData.get("note"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? errorKey("checkForm") };
  }

  const { organizationId, userId } = await getOrgContext();

  const existing = await prisma.enquiry.findFirst({
    where: { id, organizationId },
    select: { id: true, convertedStudentId: true },
  });
  if (!existing) {
    return { error: errorKey("enquiryNotFound") };
  }

  /*
    A converted enquiry keeps its ADMITTED status. Moving it back to, say, NEW
    would leave it pointing at a Student that the list then claims was never
    admitted. The form disables the control; this is the backstop, since a
    server action is a public endpoint.
  */
  const status = existing.convertedStudentId ? "ADMITTED" : parsed.data.status;

  await prisma.enquiry.update({
    where: { id: existing.id },
    data: {
      status,
      followUpDate: parsed.data.followUpDate ?? null,
    },
  });

  // Appended only after the enquiry is confirmed to be in this organization —
  // updateMany above is the tenant check.
  if (parsed.data.note) {
    await prisma.enquiryNote.create({
      data: { organizationId, enquiryId: id, authorId: userId, body: parsed.data.note },
    });
  }

  revalidatePath("/enquiries");
  revalidatePath("/enquiries/follow-ups");
  revalidatePath(`/enquiries/${id}`);

  return { success: true };
}
