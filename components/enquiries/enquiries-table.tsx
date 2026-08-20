import Link from "next/link";
import type { Enquiry } from "@/generated/prisma/client";
import { FOLLOW_UP_TONE_STYLES, formatFollowUp } from "@/lib/enquiries";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/enquiries/status-badge";

export type EnquiryRow = Pick<
  Enquiry,
  "id" | "studentName" | "phone" | "interestedIn" | "status" | "followUpDate"
>;

export function EnquiriesTable({ enquiries }: { enquiries: EnquiryRow[] }) {
  if (enquiries.length === 0) {
    return (
      <div className="flex min-h-60 items-center justify-center rounded-xl border border-dashed border-border bg-card">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">No enquiries yet.</p>
          <Button className="mt-3" nativeButton={false} render={<Link href="/enquiries/new" />}>
            Add your first enquiry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full min-w-160 text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Phone</th>
            <th className="px-4 py-3 font-medium">Interested In</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Follow-up</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {enquiries.map((enquiry) => {
            const followUp = formatFollowUp(enquiry.followUpDate);
            return (
              <tr key={enquiry.id} className="group cursor-pointer hover:bg-muted/60">
                <td className="px-4 py-3">
                  <Link
                    href={`/enquiries/${enquiry.id}`}
                    className="font-medium text-foreground group-hover:text-primary"
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
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
