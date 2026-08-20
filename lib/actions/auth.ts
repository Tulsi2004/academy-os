"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { UserRole } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/current-org";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, deleteSession, requireRole, requireUser } from "@/lib/auth/session";

export type AuthActionState = {
  error?: string;
  success?: boolean;
};

const emailField = z.string().trim().toLowerCase().email("Enter a valid email");
const passwordField = z.string().min(8, "Password must be at least 8 characters");

const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required"),
});

export async function login(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Enter your email and password." };
  }

  const organization = await getCurrentOrganization();

  const user = await prisma.user.findUnique({
    where: {
      organizationId_email: { organizationId: organization.id, email: parsed.data.email },
    },
  });

  const invalidCredentials = { error: "Invalid email or password." };

  if (!user || !user.active) return invalidCredentials;

  const passwordMatches = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!passwordMatches) return invalidCredentials;

  await createSession(user.id);
  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}

const setupSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters long."),
    email: emailField,
    password: passwordField,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, "Passwords do not match.");

export async function completeSetup(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = setupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const organization = await getCurrentOrganization();
  const existingUsers = await prisma.user.count({ where: { organizationId: organization.id } });

  if (existingUsers > 0) {
    return { error: "Setup has already been completed." };
  }

  const passwordHash = await hashPassword(parsed.data.password);

  const user = await prisma.user.create({
    data: {
      organizationId: organization.id,
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: UserRole.OWNER,
    },
  });

  await createSession(user.id);
  redirect("/");
}

const createStaffSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters long."),
  email: emailField,
  role: z.enum(UserRole),
  password: passwordField,
});

export async function createStaffAccount(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  await requireRole([UserRole.OWNER, UserRole.ADMIN]);

  const parsed = createStaffSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const organization = await getCurrentOrganization();

  const existing = await prisma.user.findUnique({
    where: {
      organizationId_email: { organizationId: organization.id, email: parsed.data.email },
    },
  });

  if (existing) {
    return { error: "A user with this email already exists." };
  }

  const passwordHash = await hashPassword(parsed.data.password);

  await prisma.user.create({
    data: {
      organizationId: organization.id,
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: parsed.data.role,
    },
  });

  revalidatePath("/settings");
  return { success: true };
}

const resetPasswordSchema = z.object({
  userId: z.string().trim().min(1, "Missing user."),
  password: passwordField,
});

export async function resetStaffPassword(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  await requireRole([UserRole.OWNER, UserRole.ADMIN]);

  const parsed = resetPasswordSchema.safeParse({
    userId: formData.get("userId"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const organization = await getCurrentOrganization();
  const passwordHash = await hashPassword(parsed.data.password);

  const { count } = await prisma.user.updateMany({
    where: { id: parsed.data.userId, organizationId: organization.id },
    data: { passwordHash },
  });

  if (count === 0) {
    return { error: "User not found." };
  }

  await prisma.session.deleteMany({ where: { userId: parsed.data.userId } });

  revalidatePath("/settings");
  return { success: true };
}

export async function toggleStaffActive(userId: string, nextActive: boolean) {
  const actor = await requireRole([UserRole.OWNER, UserRole.ADMIN]);

  if (actor.id === userId && !nextActive) {
    return;
  }

  const organization = await getCurrentOrganization();

  await prisma.user.updateMany({
    where: { id: userId, organizationId: organization.id },
    data: { active: nextActive },
  });

  if (!nextActive) {
    await prisma.session.deleteMany({ where: { userId } });
  }

  revalidatePath("/settings");
}

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordField,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, "New passwords do not match.");

export async function changeOwnPassword(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const sessionUser = await requireUser();

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: sessionUser.id } });
  const currentMatches = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!currentMatches) {
    return { error: "Current password is incorrect." };
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  revalidatePath("/settings");
  return { success: true };
}
