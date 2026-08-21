import { redirect } from "next/navigation";
import { auth, currentUser as currentClerkUser } from "@clerk/nextjs/server";
import { SignOutButton } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/current-org";
import { getCurrentUser } from "@/lib/auth/current-user";
import { SetupOwnerForm } from "@/components/auth/setup-owner-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function SetupPage() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    redirect("/login");
  }

  const existingUser = await getCurrentUser();
  if (existingUser) {
    redirect("/");
  }

  const organization = await getCurrentOrganization();
  const memberCount = await prisma.user.count({
    where: { organizationId: organization.id },
  });

  if (memberCount > 0) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Access pending</CardTitle>
          <CardDescription>
            {organization.name} already has team members set up. Ask an admin to
            add your email to your academy&apos;s user list, then sign in again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignOutButton>
            <Button variant="outline" className="w-full">
              Sign out
            </Button>
          </SignOutButton>
        </CardContent>
      </Card>
    );
  }

  const clerkUser = await currentClerkUser();
  const defaultName =
    [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") || "";

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Welcome to {organization.name}</CardTitle>
        <CardDescription>
          You&apos;re the first person here — set up your owner account to get
          started.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SetupOwnerForm defaultName={defaultName} />
      </CardContent>
    </Card>
  );
}
