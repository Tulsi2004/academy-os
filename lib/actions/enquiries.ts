"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { EnquiryStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { getOrgContext } from "@/lib/auth/org-context";
import {
  createEnquirySchema,
  isCompletePhone,
  normalizePhone,
} from "@/lib/validations/enquiry";

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

const optionalDate = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? new Date(value) : undefined));

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
      error: parsed.error.issues[0]?.message ?? "Please check the form and try again.",
      fieldErrors,
    };
  }

  const { notes, ...fields } = parsed.data;

  // One transaction so an enquiry never lands without the note that was typed
  // alongside it.
  const enquiry = await prisma.$transaction(async (tx) => {
    const created = await tx.enquiry.create({
      data: { ...fields, organizationId, status: "NEW" },
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

const updateEnquirySchema = z.object({
  status: z.enum(EnquiryStatus),
  followUpDate: optionalDate,
  // A new entry for the timeline, not a replacement for what came before.
  note: optionalText,
});

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
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const { organizationId, userId } = await getOrgContext();

  const { count } = await prisma.enquiry.updateMany({
    where: { id, organizationId },
    data: {
      status: parsed.data.status,
      followUpDate: parsed.data.followUpDate ?? null,
    },
  });

  if (count === 0) {
    return { error: "Enquiry not found." };
  }

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
