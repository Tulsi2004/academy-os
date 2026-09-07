import { cache } from "react";
import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import type { UserRole } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

/*
  Every database query in the app resolves its tenant through this file. The
  organization comes from the signed-in user's own row and nowhere else — never
  from a form field, URL, header or environment variable.
*/

export type OrgContextFailure =
  // No Clerk session at all.
  | "UNAUTHENTICATED"
  // Signed in, but the Clerk account has no verified email to match on.
  | "NO_EMAIL"
  // Signed in, but no User row belongs to this person.
  | "NO_ACCESS";

export class OrgContextError extends Error {
  constructor(readonly reason: OrgContextFailure) {
    super(reason);
    this.name = "OrgContextError";
  }
}

export type OrgContext = {
  userId: string; // our User.id, NOT Clerk's
  organizationId: string;
  organizationName: string;
  role: UserRole;
  name: string;
  email: string;
};

const withOrganization = { organization: { select: { name: true } } } as const;

/*
  Staff rows are created by an admin before that person has ever signed in, so
  `clerkUserId` starts null and is filled on first login by matching email.

  Lazy linking rather than Clerk webhooks: webhooks fail, retry and arrive out
  of order, and you end up writing reconciliation code for a problem you do not
  have. Linking on first sign-in needs no endpoint and no sync. A Clerk account
  with no matching User row simply gets NO_ACCESS.

  `cache()` is React's request-level memoisation — many server components can
  call getOrgContext() in one request and only one query runs.
*/
export const getOrgContext = cache(async (): Promise<OrgContext> => {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) throw new OrgContextError("UNAUTHENTICATED");

  // 1. Already linked — the normal path.
  let user = await prisma.user.findFirst({
    where: { clerkUserId, active: true },
    include: withOrganization,
  });

  // 2. First sign-in — link by email, once.
  if (!user) {
    const clerkUser = await currentUser();
    const email = clerkUser?.primaryEmailAddress?.emailAddress;
    if (!email) throw new OrgContextError("NO_EMAIL");

    const pending = await prisma.user.findFirst({
      where: { email, clerkUserId: null, active: true },
    });
    if (!pending) throw new OrgContextError("NO_ACCESS");

    user = await prisma.user.update({
      where: { id: pending.id },
      data: { clerkUserId },
      include: withOrganization,
    });
  }

  return {
    userId: user.id,
    organizationId: user.organizationId,
    organizationName: user.organization.name,
    role: user.role,
    name: user.name,
    email: user.email,
  };
});

/*
  What every page and layout should call. A layout and the page inside it render
  in parallel, so a page calling getOrgContext() directly throws
  UNAUTHENTICATED on its own while the layout races to redirect — the redirect
  usually won, but the throw was logged as a server error on every anonymous
  request and the outcome depended on which finished first.

  Server actions keep using getOrgContext(): for them an unauthenticated call
  really is an error, and there is no page to redirect.
*/
export async function requireOrgContext(): Promise<OrgContext> {
  try {
    return await getOrgContext();
  } catch (error) {
    if (!(error instanceof OrgContextError)) throw error;
    redirect(error.reason === "UNAUTHENTICATED" ? "/login" : "/no-access");
  }
}
