import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/current-org";
import { formatFollowUp, type FollowUpTone } from "@/lib/enquiries";
import { EnquiriesHeader } from "@/components/enquiries/enquiries-header";
import { EnquiriesTable, type EnquiryRow } from "@/components/enquiries/enquiries-table";

const GROUPS: { tone: FollowUpTone; label: string }[] = [
  { tone: "overdue", label: "Overdue" },
  { tone: "today", label: "Today" },
  { tone: "tomorrow", label: "Tomorrow" },
  { tone: "upcoming", label: "Upcoming" },
];

export default async function FollowUpsPage() {
  const organization = await getCurrentOrganization();

  const enquiries = await prisma.enquiry.findMany({
    where: {
      organizationId: organization.id,
      followUpDate: { not: null },
    },
    orderBy: { followUpDate: "asc" },
    select: {
      id: true,
      studentName: true,
      phone: true,
      interestedIn: true,
      status: true,
      followUpDate: true,
    },
  });

  const grouped = new Map<FollowUpTone, EnquiryRow[]>();
  for (const enquiry of enquiries) {
    const tone = formatFollowUp(enquiry.followUpDate).tone;
    grouped.set(tone, [...(grouped.get(tone) ?? []), enquiry]);
  }

  return (
    <div className="space-y-6">
      <EnquiriesHeader />

      {enquiries.length === 0 ? (
        <EnquiriesTable enquiries={[]} />
      ) : (
        <div className="space-y-8">
          {GROUPS.filter((group) => (grouped.get(group.tone)?.length ?? 0) > 0).map((group) => (
            <div key={group.tone} className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                {group.label}{" "}
                <span className="text-zinc-400 dark:text-zinc-500">
                  ({grouped.get(group.tone)?.length})
                </span>
              </h3>
              <EnquiriesTable enquiries={grouped.get(group.tone) ?? []} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
