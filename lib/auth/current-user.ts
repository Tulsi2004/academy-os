import { auth, currentUser as currentClerkUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/current-org";

export async function getCurrentUser() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return null;

  const organization = await getCurrentOrganization();

  const linked = await prisma.user.findFirst({
    where: { organizationId: organization.id, clerkUserId },
  });
  if (linked) return linked;

  // Not linked yet — if an existing (pre-Clerk) User row matches this
  // Clerk account's email, adopt it instead of leaving it orphaned.
  const clerkUser = await currentClerkUser();
  const email = clerkUser?.primaryEmailAddress?.emailAddress;
  if (!email) return null;

  const byEmail = await prisma.user.findFirst({
    where: { organizationId: organization.id, email, clerkUserId: null },
  });
  if (!byEmail) return null;

  return prisma.user.update({
    where: { id: byEmail.id },
    data: { clerkUserId },
  });
}
