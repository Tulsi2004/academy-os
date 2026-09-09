"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getOrgContext } from "@/lib/auth/org-context";
import { studentIntakeSchema } from "@/lib/validations/conversion";
import { errorKey } from "@/lib/i18n/messages";

export type CreateStudentResult =
  | { ok: true; studentId: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

/*
  Adding someone who is already learning here.

  Every academy that installs this software has a roll before it has a single
  enquiry — the children who have been coming to Saturday class for three years.
  Without this they could only be entered by inventing a fake enquiry and
  immediately admitting it, which would leave the conversion figures claiming
  the academy converts every enquiry it ever receives.

  Deliberately not a variant of convertEnquiry: there is no enquiry to close, no
  status to move, and no note to append. What it shares — the shape of a Student
  and its Parent — it shares through studentIntakeSchema.
*/
export async function createStudent(input: unknown): Promise<CreateStudentResult> {
  const { organizationId } = await getOrgContext();

  const parsed = studentIntakeSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && !fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? errorKey("checkForm"),
      fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    // One transaction: a Student without their Parent, or a fee with no student
    // to hang off, is worse than nothing having been saved at all.
    const studentId = await prisma.$transaction(async (tx) => {
      // Matched on phone within this organization — the same rule conversion
      // uses, so a second child of the same parent joins the existing record.
      const existingParent = await tx.parent.findFirst({
        where: { organizationId, phone: data.parentPhone },
        select: { id: true },
      });
      const parent =
        existingParent ??
        (await tx.parent.create({
          data: {
            organizationId,
            name: data.parentName,
            phone: data.parentPhone,
            email: data.parentEmail ?? null,
          },
          select: { id: true },
        }));

      const student = await tx.student.create({
        data: {
          organizationId,
          parentId: parent.id,
          firstName: data.firstName,
          lastName: data.lastName ?? null,
          dateOfBirth: data.dateOfBirth ?? null,
          phone: data.studentPhone ?? null,
          email: data.studentEmail ?? null,
          address: data.address ?? null,
          experience: data.experience ?? null,
        },
        select: { id: true },
      });

      if (data.batchId) {
        const batch = await tx.batch.findFirst({
          where: { id: data.batchId, organizationId },
          select: { id: true },
        });
        if (!batch) throw new StudentIntakeError(errorKey("batchGone"));
        await tx.enrollment.create({
          data: { organizationId, studentId: student.id, batchId: batch.id },
        });
      }

      // CLAUDE.md: a Payment carries exactly one of studentId or enquiryId.
      // There is no enquiry in this path at all, so studentId is the only one
      // that could be set.
      if (data.registrationFee !== undefined) {
        await tx.payment.create({
          data: {
            organizationId,
            studentId: student.id,
            type: "REGISTRATION",
            amount: data.registrationFee.toFixed(2),
            status: "PAID",
            paidAt: new Date(),
          },
        });
      }

      return student.id;
    });

    revalidatePath("/students");

    return { ok: true, studentId };
  } catch (error) {
    if (error instanceof StudentIntakeError) return { ok: false, error: error.message };
    throw error;
  }
}

class StudentIntakeError extends Error {}
