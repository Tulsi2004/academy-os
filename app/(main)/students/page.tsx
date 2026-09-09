import Link from "next/link";
import { UserPlusIcon } from "lucide-react";
import { requireOrgContext } from "@/lib/auth/org-context";
import { studentsHref } from "@/lib/students";
import { listStudents } from "@/lib/students-query";
import { StudentsSearch } from "@/components/students/students-search";
import { StudentsTable } from "@/components/students/students-table";
import { Button } from "@/components/ui/button";
import { getDictionary } from "@/lib/i18n/server";
import { intlLocale } from "@/lib/i18n/locales";
import { pluralize } from "@/lib/i18n/format";

export const dynamic = "force-dynamic";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page } = await searchParams;
  const requestedPage = Number.parseInt(page ?? "1", 10);

  const { organizationId } = await requireOrgContext();
  const [{ locale, t }, result] = await Promise.all([
    getDictionary(),
    listStudents({
      organizationId,
      q,
      page: Number.isFinite(requestedPage) ? requestedPage : 1,
    }),
  ]);
  const intl = intlLocale(locale);

  const searching = Boolean(q?.trim());

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">{t.students.title}</h2>
          <p className="mt-1 max-w-prose text-sm text-muted-foreground">
            {t.students.subtitle}
          </p>
        </div>
        <Button
          size="lg"
          className="shadow-sm"
          nativeButton={false}
          render={<Link href="/students/new" />}
        >
          <UserPlusIcon aria-hidden="true" />
          {t.students.newStudent}
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <StudentsSearch />
        {result.total > 0 && (
          <p className="text-sm text-muted-foreground">
            {pluralize(
              { one: t.students.countOne, other: t.students.countOther },
              result.total,
            )}
          </p>
        )}
      </div>

      <StudentsTable students={result.rows} intl={intl} filtered={searching} />

      {result.pageCount > 1 && (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {result.page} / {result.pageCount}
          </p>
          <div className="flex items-center gap-2">
            <PageLink
              href={studentsHref({ q, page: result.page - 1 })}
              disabled={result.page <= 1}
              label={t.common.previous}
            />
            <PageLink
              href={studentsHref({ q, page: result.page + 1 })}
              disabled={result.page >= result.pageCount}
              label={t.common.next}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function PageLink({
  href,
  disabled,
  label,
}: {
  href: string;
  disabled: boolean;
  label: string;
}) {
  const className =
    "rounded-full border border-border px-3 py-1.5 text-xs font-medium transition-colors";
  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className={`${className} cursor-not-allowed text-muted-foreground/50`}
      >
        {label}
      </span>
    );
  }
  return (
    <Link href={href} className={`${className} bg-card text-foreground hover:bg-muted`}>
      {label}
    </Link>
  );
}
