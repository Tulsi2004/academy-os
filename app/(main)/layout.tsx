import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { requireOrgContext } from "@/lib/auth/org-context";

export default async function MainLayout({ children }: { children: ReactNode }) {
  const context = await requireOrgContext();

  return (
    <AppShell
      organizationName={context.organizationName}
      userName={context.name}
      userEmail={context.email}
    >
      {children}
    </AppShell>
  );
}
