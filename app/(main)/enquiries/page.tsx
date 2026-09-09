import Link from "next/link";
import { EnquiryStatus } from "@/generated/prisma/enums";
import { requireOrgContext } from "@/lib/auth/org-context";
import { enquiriesHref } from "@/lib/enquiries";
import { dueFollowUpCount, enquirySummary, listEnquiries } from "@/lib/enquiries-query";
import { listCourseOptions } from "@/lib/courses-query";
import { getDictionary } from "@/lib/i18n/server";
import { fill, pluralize } from "@/lib/i18n/format";
import { AttentionBar } from "@/components/enquiries/attention-bar";
import { EnquiriesHeader } from "@/components/enquiries/enquiries-header";
import { EnquiriesSearch } from "@/components/enquiries/enquiries-search";
import { EnquiriesTable } from "@/components/enquiries/enquiries-table";
import { StatusFilter } from "@/components/enquiries/status-filter";

const STATUS_FILTERS = Object.values(EnquiryStatus);

export default async function EnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const { q, status, page } = await searchParams;

  const activeStatus = STATUS_FILTERS.includes(status as EnquiryStatus)
    ? (status as EnquiryStatus)
    : undefined;
  const requestedPage = Number.parseInt(page ?? "1", 10);

  const { organizationId } = await requireOrgContext();
  const [result, summary, dueCount, courses, { t }] = await Promise.all([
    listEnquiries({
      organizationId,
      q,
      status: activeStatus,
      page: Number.isFinite(requestedPage) ? requestedPage : 1,
    }),
    enquirySummary({ organizationId, q }),
    dueFollowUpCount(organizationId),
    listCourseOptions(organizationId),
    getDictionary(),
  ]);

  const searching = Boolean(q?.trim()) || Boolean(activeStatus);

  return (
    <div className="space-y-6">
      <EnquiriesHeader courses={courses} dueCount={dueCount} />

      {/* Only when nothing is filtered: with a search or a status applied, the
          strip would be counting a different set of enquiries from the table
          under it, which is worse than not showing it at all. */}
      {!searching && (
        <AttentionBar
          overdue={summary.overdue}
          dueToday={summary.dueToday}
          uncontacted={summary.byStatus.NEW}
        />
      )}

      <div className="flex flex-col gap-3">
        <EnquiriesSearch />
        <StatusFilter
          q={q}
          activeStatus={activeStatus}
          total={summary.total}
          byStatus={summary.byStatus}
        />
      </div>

      <EnquiriesTable enquiries={result.rows} filtered={searching} courses={courses} />

      {(result.pageCount > 1 || result.total > 0) && (
        <div className="flex flex-col-reverse items-start justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-sm text-muted-foreground">
            {pluralize(
              { one: t.enquiries.pagination.countOne, other: t.enquiries.pagination.countOther },
              result.total,
            )}
            {result.pageCount > 1 && (
              <>
                {" · "}
                {fill(t.enquiries.pagination.page, {
                  page: result.page,
                  pages: result.pageCount,
                })}
              </>
            )}
          </p>
          {result.pageCount > 1 && (
            <div className="flex items-center gap-2">
              <PageLink
                href={enquiriesHref({ q, status: activeStatus, page: result.page - 1 })}
                disabled={result.page <= 1}
                label={t.common.previous}
              />
              <PageLink
                href={enquiriesHref({ q, status: activeStatus, page: result.page + 1 })}
                disabled={result.page >= result.pageCount}
                label={t.common.next}
              />
            </div>
          )}
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
