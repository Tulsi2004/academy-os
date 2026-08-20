import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/generated/prisma/enums";
import { ChangePasswordForm } from "@/components/settings/change-password-form";
import { TeamPanel } from "@/components/settings/team-panel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SettingsPage() {
  const user = await requireUser();
  const isAdmin = user.role === UserRole.OWNER || user.role === UserRole.ADMIN;

  const staff = isAdmin
    ? await prisma.user.findMany({
        where: { organizationId: user.organizationId },
        orderBy: { createdAt: "asc" },
        select: { id: true, name: true, email: true, role: true, active: true },
      })
    : [];

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account and academy preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>Update the password for your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>

      {isAdmin && <TeamPanel staff={staff} currentUserId={user.id} />}
    </div>
  );
}
