import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/current-org";
import { SetupForm } from "@/components/auth/setup-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function SetupPage() {
  const organization = await getCurrentOrganization();
  const userCount = await prisma.user.count({ where: { organizationId: organization.id } });

  if (userCount > 0) {
    redirect("/login");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set up {organization.name}</CardTitle>
        <CardDescription>Create the owner account to get started.</CardDescription>
      </CardHeader>
      <CardContent>
        <SetupForm />
      </CardContent>
    </Card>
  );
}
