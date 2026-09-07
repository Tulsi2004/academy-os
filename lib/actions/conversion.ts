"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getOrgContext } from "@/lib/auth/org-context";
import { convertEnquirySchema } from "@/lib/validations/conversion";

export type ConvertEnquiryResult =
  | { ok: true; studentId: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

/*
  One transaction, because a partial conversion leaves orphaned rows: a Student
  with no Enquiry pointing at them, or an Enquiry marked ADMITTED with no
  Student behind it. Every read and write inside is scoped to the caller's
  organization.
*/
export async function convertEnquiry(
  enquiryId: string,
  input: unknown,
): Promise<ConvertEnquiryResult> {
  const { organizationId, userId } = await getOrgContext();

  const parsed = convertEnquirySchema.safeParse(input);
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

  const data = parsed.data;

  try {
    const studentId = await prisma.$transaction(async (tx) => {
      const enquiry = await tx.enquiry.findFirst({
        where: { id: enquiryId, organizationId },
        select: { id: true, convertedStudentId: true, studentName: true },
      });
      if (!enquiry) throw new ConversionError("Enquiry not found.");
      if (enquiry.convertedStudentId) {
        throw new ConversionError("This enquiry has already been converted.");
      }

      // 1. Create or reuse the parent, matched on phone within this organization.
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

      // 2. The student.
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

      // 3. Enrolment, only if a batch was picked — and only one from this org.
      if (data.batchId) {
        const batch = await tx.batch.findFirst({
          where: { id: data.batchId, organizationId },
          select: { id: true },
        });
        if (!batch) throw new ConversionError("That batch no longer exists.");
        await tx.enrollment.create({
          data: { organizationId, studentId: student.id, batchId: batch.id },
        });
      }

      // 4. Registration fee, attached to the Student. Never enquiryId as well —
      //    exactly one of the two is set on any Payment row.
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

      // 5. Close the enquiry out.
      await tx.enquiry.update({
        where: { id: enquiry.id },
        data: {
          status: "ADMITTED",
          convertedStudentId: student.id,
          parentId: parent.id,
        },
      });

      await tx.enquiryNote.create({
        data: {
          organizationId,
          enquiryId: enquiry.id,
          authorId: userId,
          body: `Converted to student ${[data.firstName, data.lastName].filter(Boolean).join(" ")}.`,
        },
      });

      return student.id;
    });

    revalidatePath("/enquiries");
    revalidatePath("/enquiries/follow-ups");
    revalidatePath(`/enquiries/${enquiryId}`);

    return { ok: true, studentId };
  } catch (error) {
    if (error instanceof ConversionError) return { ok: false, error: error.message };
    throw error;
  }
}

class ConversionError extends Error {}
