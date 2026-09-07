import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { OrgContextError, getOrgContext } from "@/lib/auth/org-context";

export default async function MainLayout({ children }: { children: ReactNode }) {
  let context;
  try {
    context = await getOrgContext();
  } catch (error) {
    // Anything that isn't a tenancy failure is a real bug — let it reach the
    // error boundary rather than hiding it behind a redirect.
    if (!(error instanceof OrgContextError)) throw error;
    redirect(error.reason === "UNAUTHENTICATED" ? "/login" : "/no-access");
  }

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
