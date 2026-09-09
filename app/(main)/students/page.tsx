import Link from "next/link";
import { requireOrgContext } from "@/lib/auth/org-context";
import { studentsHref } from "@/lib/students";
import { listStudents } from "@/lib/students-query";
import { StudentsSearch } from "@/components/students/students-search";
import { StudentsTable } from "@/components/students/students-table";
import { getLocale } from "@/lib/i18n/server";
import { intlLocale } from "@/lib/i18n/locales";

export const dynamic = "force-dynamic";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page } = await searchParams;
  const requestedPage = Number.parseInt(page ?? "1", 10);

  const { organizationId } = await requireOrgContext();
  const intl = intlLocale(await getLocale());
  const result = await listStudents({
    organizationId,
    q,
    page: Number.isFinite(requestedPage) ? requestedPage : 1,
  });

  const searching = Boolean(q?.trim());

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Students</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Everyone who has been admitted. Search by student name, parent name or either phone
          number.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <StudentsSearch />
        {result.total > 0 && (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{result.total}</span>{" "}
            {result.total === 1 ? "student" : "students"}
            {searching ? " matching" : ""}
          </p>
        )}
      </div>

      <StudentsTable students={result.rows} intl={intl} filtered={searching} />

      {result.pageCount > 1 && (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Page {result.page} of {result.pageCount}
          </p>
          <div className="flex items-center gap-2">
            <PageLink
              href={studentsHref({ q, page: result.page - 1 })}
              disabled={result.page <= 1}
              label="Previous"
            />
            <PageLink
              href={studentsHref({ q, page: result.page + 1 })}
              disabled={result.page >= result.pageCount}
              label="Next"
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
