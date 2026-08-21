"use server";

import { redirect } from "next/navigation";
import { auth, currentUser as currentClerkUser } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/current-org";

export type SetupActionState = {
  error?: string;
};

const bootstrapOwnerSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
});

export async function bootstrapOwner(
  _prevState: SetupActionState,
  formData: FormData,
): Promise<SetupActionState> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    redirect("/login");
  }

  const clerkUser = await currentClerkUser();
  const email = clerkUser?.primaryEmailAddress?.emailAddress;
  if (!email) {
    return { error: "Your Clerk account has no verified email address." };
  }

  const parsed = bootstrapOwnerSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }

  const organization = await getCurrentOrganization();

  // Guard against a race where someone else already claimed ownership.
  const existingCount = await prisma.user.count({
    where: { organizationId: organization.id },
  });
  if (existingCount > 0) {
    return { error: "This academy already has an owner. Ask them to invite you instead." };
  }

  await prisma.user.create({
    data: {
      organizationId: organization.id,
      clerkUserId,
      name: parsed.data.name,
      email,
      role: "OWNER",
    },
  });

  redirect("/");
}
