import Link from "next/link";
import { EnquiryStatus } from "@/generated/prisma/enums";
import { requireOrgContext } from "@/lib/auth/org-context";
import { ENQUIRY_STATUS_LABELS, enquiriesHref } from "@/lib/enquiries";
import { listEnquiries } from "@/lib/enquiries-query";
import { EnquiriesHeader } from "@/components/enquiries/enquiries-header";
import { EnquiriesSearch } from "@/components/enquiries/enquiries-search";
import { EnquiriesTable } from "@/components/enquiries/enquiries-table";

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
  const result = await listEnquiries({
    organizationId,
    q,
    status: activeStatus,
    page: Number.isFinite(requestedPage) ? requestedPage : 1,
  });

  const searching = Boolean(q?.trim()) || Boolean(activeStatus);

  return (
    <div className="space-y-6">
      <EnquiriesHeader />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <EnquiriesSearch />
        {result.dueCount > 0 && (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{result.dueCount}</span> due for
            follow-up
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterChip href={enquiriesHref({ q })} active={!activeStatus} label="All" />
        {STATUS_FILTERS.map((value) => (
          <FilterChip
            key={value}
            href={enquiriesHref({ q, status: value })}
            active={activeStatus === value}
            label={ENQUIRY_STATUS_LABELS[value]}
          />
        ))}
      </div>

      <EnquiriesTable enquiries={result.rows} filtered={searching} />

      {result.pageCount > 1 && (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Page {result.page} of {result.pageCount} · {result.total}{" "}
            {result.total === 1 ? "enquiry" : "enquiries"}
          </p>
          <div className="flex items-center gap-2">
            <PageLink
              href={enquiriesHref({ q, status: activeStatus, page: result.page - 1 })}
              disabled={result.page <= 1}
              label="Previous"
            />
            <PageLink
              href={enquiriesHref({ q, status: activeStatus, page: result.page + 1 })}
              disabled={result.page >= result.pageCount}
              label="Next"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function FilterChip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:bg-muted"
      }`}
    >
      {label}
    </Link>
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
