"use client";

import Link from "next/link";
import { ChevronRightIcon, PhoneIcon, MessageCircleIcon } from "lucide-react";
import type { EnquiryStatus } from "@/generated/prisma/enums";
import {
  FOLLOW_UP_TONE_STYLES,
  followUpLabel,
  formatDate,
  telHref,
  whatsAppHref,
} from "@/lib/enquiries";
import { fill } from "@/lib/i18n/format";
import { useLanguage } from "@/lib/i18n/language-provider";
import type { CourseOption } from "@/lib/courses-query";
import { EnquiryCaptureSheet } from "@/components/enquiries/enquiry-capture-sheet";
import { StatusBadge } from "@/components/enquiries/status-badge";

export type EnquiryRow = {
  id: string;
  studentName: string;
  phone: string;
  interestedIn: string | null;
  status: EnquiryStatus;
  followUpDate: Date | null;
  createdAt: Date;
  course?: { name: string } | null;
};

/*
  The list has two jobs: show who is waiting, and get someone on the phone. So
  every row carries its own Call and WhatsApp action rather than making the
  reader open the record, find the number, and copy it into a dialler.

  That a row opens a full record has to be visible standing still, not just on
  hover: the name is coloured and underlined like the link it is, and a chevron
  closes every row. A row that only reveals itself when the pointer lands on it
  is invisible to anyone who has not already guessed it is there.

  It renders twice — a table from `md` up, cards below it. A six-column table on
  a phone means a sideways scroll to reach the follow-up date, which is exactly
  the column the person holding the phone came for.
*/
export function EnquiriesTable({
  enquiries,
  filtered = false,
  courses = [],
}: {
  enquiries: EnquiryRow[];
  filtered?: boolean;
  courses?: CourseOption[];
}) {
  const { t, intl } = useLanguage();

  if (enquiries.length === 0) {
    return (
      <div className="flex min-h-60 items-center justify-center rounded-xl border border-dashed border-border bg-card">
        <div className="max-w-sm px-6 text-center">
          <p className="text-sm font-medium text-foreground">
            {filtered ? t.enquiries.empty.noMatch : t.enquiries.empty.none}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered ? t.enquiries.empty.noMatchHint : t.enquiries.empty.noneHint}
          </p>
          {!filtered && (
            <EnquiryCaptureSheet
              label={t.enquiries.empty.addFirst}
              className="mt-4"
              courses={courses}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">{t.enquiries.columns.name}</th>
              <th className="px-4 py-3 font-medium">{t.enquiries.columns.phone}</th>
              <th className="px-4 py-3 font-medium">{t.enquiries.columns.interestedIn}</th>
              <th className="px-4 py-3 font-medium">{t.enquiries.columns.status}</th>
              <th className="px-4 py-3 font-medium">{t.enquiries.columns.followUp}</th>
              <th className="px-4 py-3 font-medium">{t.enquiries.columns.added}</th>
              <th className="px-4 py-3 text-right font-medium">
                {t.enquiries.columns.actions}
              </th>
              <th className="w-px py-3 pr-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {enquiries.map((enquiry) => {
              const followUp = followUpLabel(enquiry.followUpDate, t, intl);
              const overdue = followUp.tone === "overdue";

              // `relative` on the row plus a `::before` overlay on the name link
              // makes the whole row clickable while keeping it one real link — no
              // nested anchors, and it still tabs and opens in a new tab. The
              // action buttons sit above the overlay on their own stacking level.
              return (
                <tr
                  key={enquiry.id}
                  className={`group relative cursor-pointer transition-colors hover:bg-muted/60 ${
                    overdue ? "bg-[#f87483]/[0.06]" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    {/* The list's daily value is knowing what is late, so an
                        overdue row is marked on the row itself, not only in the
                        follow-up column you have to scan across to. */}
                    {overdue && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-y-0 left-0 w-1 bg-[#f87483] dark:bg-[#f8919c]"
                      />
                    )}
                    <Link
                      href={`/enquiries/${enquiry.id}`}
                      aria-label={fill(t.enquiries.row.openAria, { name: enquiry.studentName })}
                      className="font-medium text-primary underline-offset-4 before:absolute before:inset-0 before:content-[''] group-hover:underline focus-visible:outline-none focus-visible:before:ring-3 focus-visible:before:ring-ring/50"
                    >
                      {enquiry.studentName}
                    </Link>
                  </td>
                  <td className="relative z-10 w-px px-4 py-3 whitespace-nowrap text-muted-foreground">
                    <a
                      href={telHref(enquiry.phone)}
                      className="hover:text-primary hover:underline"
                    >
                      {enquiry.phone}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {enquiry.interestedIn || enquiry.course?.name || t.common.none}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={enquiry.status} />
                  </td>
                  <td
                    className={`px-4 py-3 whitespace-nowrap ${FOLLOW_UP_TONE_STYLES[followUp.tone]}`}
                    title={followUp.title}
                  >
                    {followUp.label}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {formatDate(enquiry.createdAt, intl)}
                  </td>
                  <td className="relative z-10 w-px px-4 py-3">
                    <RowActions enquiry={enquiry} labels="wide" />
                  </td>
                  {/* Decorative, and deliberately not raised above the row
                      overlay — it points at the click target rather than being
                      a second one. */}
                  <td className="w-px py-3 pr-3">
                    <ChevronRightIcon
                      aria-hidden="true"
                      className="size-4 text-muted-foreground/50 transition-colors group-hover:text-primary"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {enquiries.map((enquiry) => {
          const followUp = followUpLabel(enquiry.followUpDate, t, intl);
          const overdue = followUp.tone === "overdue";

          return (
            <li
              key={enquiry.id}
              className={`relative overflow-hidden rounded-xl border border-border bg-card p-4 ${
                overdue ? "bg-[#f87483]/[0.06]" : ""
              }`}
            >
              {overdue && (
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 w-1 bg-[#f87483] dark:bg-[#f8919c]"
                />
              )}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/enquiries/${enquiry.id}`}
                    aria-label={fill(t.enquiries.row.openAria, { name: enquiry.studentName })}
                    className="font-medium text-primary underline-offset-4 before:absolute before:inset-0 before:content-[''] focus-visible:outline-none focus-visible:before:ring-3 focus-visible:before:ring-ring/50"
                  >
                    {enquiry.studentName}
                  </Link>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {enquiry.interestedIn || enquiry.course?.name || t.common.none}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusBadge status={enquiry.status} />
                  <ChevronRightIcon
                    aria-hidden="true"
                    className="size-4 text-muted-foreground/50"
                  />
                </div>
              </div>

              <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs">
                <div className="flex gap-1.5">
                  <dt className="text-muted-foreground">{t.enquiries.columns.followUp}</dt>
                  <dd className={FOLLOW_UP_TONE_STYLES[followUp.tone]}>{followUp.label}</dd>
                </div>
                <div className="flex gap-1.5">
                  <dt className="text-muted-foreground">{t.enquiries.columns.added}</dt>
                  <dd className="text-foreground">{formatDate(enquiry.createdAt, intl)}</dd>
                </div>
              </dl>

              <div className="relative z-10 mt-3 flex items-center gap-2">
                <RowActions enquiry={enquiry} labels="always" />
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function RowActions({
  enquiry,
  labels = "none",
}: {
  enquiry: EnquiryRow;
  /*
    "wide" folds the words away below `lg`, where the table needs the room;
    "always" keeps them, which is what the phone cards want since there is
    nothing else competing for the width there.
  */
  labels?: "none" | "wide" | "always";
}) {
  const { t } = useLanguage();
  const labelClass = labels === "always" ? "" : "hidden lg:inline";
  /*
    Solid enough to look pressable. These were bordered ghosts before, which at
    the far edge of a wide table read as part of the frame rather than as the
    two things this screen exists to let you do.
  */
  const base =
    "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

  return (
    <div className="flex items-center justify-end gap-1.5">
      <a
        href={telHref(enquiry.phone)}
        className={base}
        aria-label={fill(t.enquiries.row.callAria, {
          name: enquiry.studentName,
          phone: enquiry.phone,
        })}
        title={t.enquiries.row.call}
      >
        <PhoneIcon className="size-3.5" aria-hidden="true" />
        {labels !== "none" && <span className={labelClass}>{t.enquiries.row.call}</span>}
      </a>
      <a
        href={whatsAppHref(enquiry.phone)}
        target="_blank"
        rel="noopener noreferrer"
        className={base}
        aria-label={fill(t.enquiries.row.whatsappAria, { name: enquiry.studentName })}
        title={t.enquiries.row.whatsapp}
      >
        <MessageCircleIcon className="size-3.5" aria-hidden="true" />
        {labels !== "none" && <span className={labelClass}>{t.enquiries.row.whatsapp}</span>}
      </a>
    </div>
  );
}
