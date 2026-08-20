"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ExperienceLevel, EnquiryStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/current-org";

export type EnquiryActionState = {
  error?: string;
  success?: boolean;
};

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

const createEnquirySchema = z.object({
  studentName: z.string().trim().min(1, "Student name is required"),
  parentName: optionalText,
  phone: z.string().trim().min(7, "Enter a valid phone number"),
  email: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined))
    .pipe(z.string().email("Enter a valid email").optional()),
  interestedIn: optionalText,
  experience: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined))
    .pipe(z.enum(ExperienceLevel).optional()),
  notes: optionalText,
  followUpDate: optionalDate,
});

export async function createEnquiry(
  _prevState: EnquiryActionState,
  formData: FormData,
): Promise<EnquiryActionState> {
  const parsed = createEnquirySchema.safeParse({
    studentName: formData.get("studentName"),
    parentName: formData.get("parentName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    interestedIn: formData.get("interestedIn"),
    experience: formData.get("experience"),
    notes: formData.get("notes"),
    followUpDate: formData.get("followUpDate"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const organization = await getCurrentOrganization();

  const enquiry = await prisma.enquiry.create({
    data: {
      organizationId: organization.id,
      studentName: parsed.data.studentName,
      parentName: parsed.data.parentName ?? null,
      phone: parsed.data.phone,
      email: parsed.data.email ?? null,
      interestedIn: parsed.data.interestedIn ?? null,
      experience: parsed.data.experience ?? null,
      notes: parsed.data.notes ?? null,
      followUpDate: parsed.data.followUpDate ?? null,
    },
  });

  revalidatePath("/enquiries");
  revalidatePath("/enquiries/follow-ups");
  redirect(`/enquiries/${enquiry.id}`);
}

const updateEnquirySchema = z.object({
  status: z.enum(EnquiryStatus),
  followUpDate: optionalDate,
  notes: optionalText,
});

export async function updateEnquiry(
  id: string,
  _prevState: EnquiryActionState,
  formData: FormData,
): Promise<EnquiryActionState> {
  const parsed = updateEnquirySchema.safeParse({
    status: formData.get("status"),
    followUpDate: formData.get("followUpDate"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const organization = await getCurrentOrganization();

  const { count } = await prisma.enquiry.updateMany({
    where: { id, organizationId: organization.id },
    data: {
      status: parsed.data.status,
      followUpDate: parsed.data.followUpDate ?? null,
      notes: parsed.data.notes ?? null,
    },
  });

  if (count === 0) {
    return { error: "Enquiry not found." };
  }

  revalidatePath("/enquiries");
  revalidatePath("/enquiries/follow-ups");
  revalidatePath(`/enquiries/${id}`);

  return { success: true };
}
