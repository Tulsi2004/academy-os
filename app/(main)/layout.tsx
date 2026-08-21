import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUser } from "@/lib/auth/current-user";

export default async function MainLayout({ children }: { children: ReactNode }) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect("/setup");
  }

  return <AppShell>{children}</AppShell>;
}
