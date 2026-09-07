import Link from "next/link";
import type { Enquiry } from "@/generated/prisma/client";
import { FOLLOW_UP_TONE_STYLES, formatDate, formatFollowUp } from "@/lib/enquiries";
import { EnquiryCaptureSheet } from "@/components/enquiries/enquiry-capture-sheet";
import { StatusBadge } from "@/components/enquiries/status-badge";

export type EnquiryRow = Pick<
  Enquiry,
  "id" | "studentName" | "phone" | "interestedIn" | "status" | "followUpDate" | "createdAt"
>;

export function EnquiriesTable({
  enquiries,
  filtered = false,
}: {
  enquiries: EnquiryRow[];
  filtered?: boolean;
}) {
  if (enquiries.length === 0) {
    return (
      <div className="flex min-h-60 items-center justify-center rounded-xl border border-dashed border-border bg-card">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {filtered ? "No enquiries match that search." : "No enquiries yet."}
          </p>
          {!filtered && (
            <EnquiryCaptureSheet label="Add your first enquiry" className="mt-3" />
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
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Phone</th>
            <th className="px-4 py-3 font-medium">Interested In</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Follow-up</th>
            <th className="px-4 py-3 font-medium">Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {enquiries.map((enquiry) => {
            const followUp = formatFollowUp(enquiry.followUpDate);
            const overdue = followUp.tone === "overdue";

            // `relative` on the row plus a `::before` overlay on the name link
            // makes the whole row clickable while keeping it one real link — no
            // nested anchors, and it still tabs and opens in a new tab.
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
                    className="font-medium text-foreground before:absolute before:inset-0 before:content-[''] group-hover:text-primary focus-visible:outline-none focus-visible:before:ring-3 focus-visible:before:ring-ring/50"
                  >
                    {enquiry.studentName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{enquiry.phone}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {enquiry.interestedIn || "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={enquiry.status} />
                </td>
                <td className={`px-4 py-3 ${FOLLOW_UP_TONE_STYLES[followUp.tone]}`}>
                  {followUp.label}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(enquiry.createdAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
