import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/current-org";
import { getCurrentUser } from "@/lib/auth/session";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function LoginPage() {
  const organization = await getCurrentOrganization();
  const userCount = await prisma.user.count({ where: { organizationId: organization.id } });

  if (userCount === 0) {
    redirect("/setup");
  }

  const user = await getCurrentUser();
  if (user) {
    redirect("/");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Use your staff account to access {organization.name}.</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  );
}
