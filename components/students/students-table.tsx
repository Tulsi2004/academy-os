import Link from "next/link";
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
  if (students.length === 0) {
    return (
      <div className="flex min-h-60 items-center justify-center rounded-xl border border-dashed border-border bg-card">
        <div className="max-w-sm px-6 text-center">
          <p className="text-sm text-muted-foreground">
            {filtered
              ? "No students match that search."
              : "No students yet. A student is created when you convert an enquiry."}
          </p>
          {!filtered && (
            <Link
              href="/enquiries"
              className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
            >
              Go to enquiries
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
            <th className="px-4 py-3 font-medium">Student</th>
            <th className="px-4 py-3 font-medium">Parent</th>
            <th className="px-4 py-3 font-medium">Phone</th>
            <th className="px-4 py-3 font-medium">Batches</th>
            <th className="px-4 py-3 font-medium">Joined</th>
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
                  className="font-medium text-foreground before:absolute before:inset-0 before:content-[''] group-hover:text-primary focus-visible:outline-none focus-visible:before:ring-3 focus-visible:before:ring-ring/50"
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
              <td className="px-4 py-3 text-muted-foreground">{formatDate(student.createdAt, intl)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
