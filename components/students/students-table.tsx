"use client";

import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-provider";
import { formatDate } from "@/lib/enquiries";
import { studentName } from "@/lib/students";
import type { StudentRow } from "@/lib/students-query";

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
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full min-w-180 text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3 font-medium">{t.students.columns.student}</th>
            <th className="px-4 py-3 font-medium">{t.students.columns.parent}</th>
            <th className="px-4 py-3 font-medium">{t.students.columns.phone}</th>
            <th className="px-4 py-3 font-medium">{t.students.columns.batches}</th>
            <th className="px-4 py-3 font-medium">{t.students.columns.joined}</th>
            <th className="w-px py-3 pr-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {students.map((student) => (
            // `relative` on the row plus a `::before` overlay on the name link
            // makes the whole row clickable while keeping it one real link — no
            // nested anchors, and it still tabs and opens in a new tab.
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
              <td className="px-4 py-3 text-muted-foreground">{student.parent?.name || "—"}</td>
              {/* The parent's number is the one that gets dialled — the student
                  rarely has their own, and a child's number is not the one an
                  academy calls about fees. */}
              <td className="px-4 py-3 text-muted-foreground">
                {student.parent?.phone || student.phone || "—"}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{student._count.enrollments}</td>
              <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                {formatDate(student.createdAt, intl)}
              </td>
              <td className="w-px py-3 pr-3">
                <ChevronRightIcon
                  aria-hidden="true"
                  className="size-4 text-muted-foreground/50 transition-colors group-hover:text-primary"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
