"use client";

import Link from "next/link";
import { ChevronRightIcon, MessageCircleIcon, PhoneIcon } from "lucide-react";
import { formatDate, telHref, whatsAppHref } from "@/lib/enquiries";
import { studentName } from "@/lib/students";
import type { StudentRow } from "@/lib/students-query";
import { fill } from "@/lib/i18n/format";
import { useLanguage } from "@/lib/i18n/language-provider";

/*
  Built to the same rules as the enquiry list, because it is the same job done
  to a different set of people: know who is here, and get one of them on the
  phone. So every row carries Call and WhatsApp, the name reads as a link, and
  below `md` the table becomes cards rather than something you scroll sideways.
*/
export function StudentsTable({
  students,
  intl,
  filtered = false,
}: {
  students: StudentRow[];
  /** BCP-47 tag for date formatting — the reader's locale, from the server. */
  intl: string;
  filtered?: boolean;
}) {
  const { t } = useLanguage();

  if (students.length === 0) {
    return (
      <div className="flex min-h-60 items-center justify-center rounded-xl border border-dashed border-border bg-card">
        <div className="max-w-sm px-6 text-center">
          <p className="text-sm font-medium text-foreground">
            {filtered ? t.students.empty.noMatch : t.students.empty.none}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered ? t.students.empty.noMatchHint : t.students.empty.noneHint}
          </p>
          {!filtered && (
            <Link
              href="/students/new"
              className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
            >
              {t.students.empty.addFirst}
            </Link>
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
              <th className="px-4 py-3 font-medium">{t.students.columns.student}</th>
              <th className="px-4 py-3 font-medium">{t.students.columns.parent}</th>
              <th className="px-4 py-3 font-medium">{t.students.columns.phone}</th>
              <th className="px-4 py-3 font-medium">{t.students.columns.batches}</th>
              <th className="px-4 py-3 font-medium">{t.students.columns.joined}</th>
              <th className="px-4 py-3 text-right font-medium">{t.enquiries.columns.actions}</th>
              <th className="w-px py-3 pr-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {students.map((student) => {
              const phone = callablePhoneOf(student);

              // `relative` on the row plus a `::before` overlay on the name link
              // makes the whole row clickable while keeping it one real link — no
              // nested anchors, and it still tabs and opens in a new tab.
              return (
                <tr
                  key={student.id}
                  className="group relative cursor-pointer transition-colors hover:bg-muted/60"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/students/${student.id}`}
                      className="font-medium text-primary underline-offset-4 before:absolute before:inset-0 before:content-[''] group-hover:underline focus-visible:outline-none focus-visible:before:ring-3 focus-visible:before:ring-ring/50"
                    >
                      {studentName(student)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {student.parent?.name || t.common.none}
                  </td>
                  <td className="relative z-10 w-px px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {phone ? (
                      <a href={telHref(phone)} className="hover:text-primary hover:underline">
                        {phone}
                      </a>
                    ) : (
                      t.common.none
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {student._count.enrollments}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {formatDate(student.createdAt, intl)}
                  </td>
                  <td className="relative z-10 w-px px-4 py-3">
                    <RowActions student={student} labels="wide" />
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
        {students.map((student) => (
          <li
            key={student.id}
            className="relative overflow-hidden rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  href={`/students/${student.id}`}
                  className="font-medium text-primary underline-offset-4 before:absolute before:inset-0 before:content-[''] focus-visible:outline-none focus-visible:before:ring-3 focus-visible:before:ring-ring/50"
                >
                  {studentName(student)}
                </Link>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  {student.parent?.name || t.common.none}
                </p>
              </div>
              <ChevronRightIcon
                aria-hidden="true"
                className="size-4 shrink-0 text-muted-foreground/50"
              />
            </div>

            <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs">
              <div className="flex gap-1.5">
                <dt className="text-muted-foreground">{t.students.columns.batches}</dt>
                <dd className="text-foreground">{student._count.enrollments}</dd>
              </div>
              <div className="flex gap-1.5">
                <dt className="text-muted-foreground">{t.students.columns.joined}</dt>
                <dd className="text-foreground">{formatDate(student.createdAt, intl)}</dd>
              </div>
            </dl>

            <div className="relative z-10 mt-3 flex items-center gap-2">
              <RowActions student={student} labels="always" />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

/*
  The parent's number is the one that gets dialled — the student rarely has
  their own, and a child's number is not the one an academy calls about fees.
*/
function callablePhoneOf(student: StudentRow): string | null {
  return student.parent?.phone || student.phone || null;
}

function RowActions({
  student,
  labels = "none",
}: {
  student: StudentRow;
  labels?: "none" | "wide" | "always";
}) {
  const { t } = useLanguage();
  const phone = callablePhoneOf(student);
  if (!phone) return null;

  const labelClass = labels === "always" ? "" : "hidden lg:inline";
  const base =
    "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50";
  const name = studentName(student);

  return (
    <div className="flex items-center justify-end gap-1.5">
      <a
        href={telHref(phone)}
        className={base}
        aria-label={fill(t.enquiries.row.callAria, { name, phone })}
        title={t.enquiries.row.call}
      >
        <PhoneIcon className="size-3.5" aria-hidden="true" />
        {labels !== "none" && <span className={labelClass}>{t.enquiries.row.call}</span>}
      </a>
      <a
        href={whatsAppHref(phone)}
        target="_blank"
        rel="noopener noreferrer"
        className={base}
        aria-label={fill(t.enquiries.row.whatsappAria, { name })}
        title={t.enquiries.row.whatsapp}
      >
        <MessageCircleIcon className="size-3.5" aria-hidden="true" />
        {labels !== "none" && <span className={labelClass}>{t.enquiries.row.whatsapp}</span>}
      </a>
    </div>
  );
}
