import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { requireOrgContext } from "@/lib/auth/org-context";
import { getLocale } from "@/lib/i18n/server";
import { LanguageProvider } from "@/lib/i18n/language-provider";

export default async function MainLayout({ children }: { children: ReactNode }) {
  const [context, locale] = await Promise.all([requireOrgContext(), getLocale()]);

  /*
    The provider wraps the shell and the page. Server components inside read the
    same cookie through `getDictionary()`, so both halves render the same
    language on the first paint.
  */
  return (
    <LanguageProvider initialLocale={locale}>
      <AppShell
        organizationName={context.organizationName}
        userName={context.name}
        userEmail={context.email}
      >
        {children}
      </AppShell>
    </LanguageProvider>
  );
}
