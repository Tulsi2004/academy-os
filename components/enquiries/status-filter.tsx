"use client";

import Link from "next/link";
import type { EnquiryStatus } from "@/generated/prisma/enums";
import { ENQUIRY_STATUS_OPTIONS, enquiriesHref } from "@/lib/enquiries";
import { useLanguage } from "@/lib/i18n/language-provider";

/*
  Chips carry their counts. Without them, choosing a filter is guesswork —
  "Lost" and "Interested" look equally worth clicking until one of them turns
  out to be empty, and the reader has to come back to find out.

  Counts ignore the active status but respect the search, so they always
  describe the list the reader is looking at.
*/
export function StatusFilter({
  q,
  activeStatus,
  total,
  byStatus,
}: {
  q?: string;
  activeStatus?: EnquiryStatus;
  total: number;
  byStatus: Record<EnquiryStatus, number>;
}) {
  const { t } = useLanguage();

  return (
    <div
      className="-mx-1 flex flex-wrap items-center gap-2 overflow-x-auto px-1 pb-1"
      role="group"
      aria-label={t.enquiries.filters.label}
    >
      <Chip
        href={enquiriesHref({ q })}
        active={!activeStatus}
        label={t.enquiries.filters.all}
        count={total}
      />
      {ENQUIRY_STATUS_OPTIONS.map((status) => (
        <Chip
          key={status}
          href={enquiriesHref({ q, status })}
          active={activeStatus === status}
          label={t.enquiries.status[status]}
          hint={t.enquiries.statusHint[status]}
          count={byStatus[status] ?? 0}
        />
      ))}
    </div>
  );
}

function Chip({
  href,
  active,
  label,
  hint,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  hint?: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      title={hint}
      aria-current={active ? "true" : undefined}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:bg-muted"
      } ${count === 0 && !active ? "opacity-60" : ""}`}
    >
      {label}
      <span className={active ? "text-primary-foreground/70" : "text-muted-foreground/70"}>
        {count}
      </span>
    </Link>
  );
}
