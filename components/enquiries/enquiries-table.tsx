import Link from "next/link";
import type { Enquiry } from "@/generated/prisma/client";
import { FOLLOW_UP_TONE_STYLES, formatFollowUp } from "@/lib/enquiries";
import { StatusBadge } from "@/components/enquiries/status-badge";

export type EnquiryRow = Pick<
  Enquiry,
  "id" | "studentName" | "phone" | "interestedIn" | "status" | "followUpDate"
>;

export function EnquiriesTable({ enquiries }: { enquiries: EnquiryRow[] }) {
  if (enquiries.length === 0) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900">
        <div className="text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No enquiries yet.</p>
          <Link
            href="/enquiries/new"
            className="mt-3 inline-flex items-center rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Add your first enquiry
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Phone</th>
            <th className="px-4 py-3 font-medium">Interested In</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Follow-up</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {enquiries.map((enquiry) => {
            const followUp = formatFollowUp(enquiry.followUpDate);
            return (
              <tr
                key={enquiry.id}
                className="group cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/enquiries/${enquiry.id}`}
                    className="font-medium text-zinc-900 group-hover:text-indigo-600 dark:text-zinc-50 dark:group-hover:text-indigo-400"
                  >
                    {enquiry.studentName}
                  </Link>
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{enquiry.phone}</td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
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
