import { getOrgContext } from "@/lib/auth/org-context";
import { dueFollowUpWhere } from "@/lib/enquiries-query";
import { formatFollowUp, type FollowUpTone } from "@/lib/enquiries";
import { prisma } from "@/lib/prisma";
import { EnquiriesHeader } from "@/components/enquiries/enquiries-header";
import { EnquiriesTable, type EnquiryRow } from "@/components/enquiries/enquiries-table";

export const dynamic = "force-dynamic";

// Only what is actually due — overdue and today. A follow-up set for next week
// is not this morning's work, and an admitted or lost enquiry is never work.
const GROUPS: { tone: FollowUpTone; label: string }[] = [
  { tone: "overdue", label: "Overdue" },
  { tone: "today", label: "Today" },
];

export default async function FollowUpsPage() {
  const { organizationId } = await getOrgContext();

  const enquiries = await prisma.enquiry.findMany({
    where: { AND: [{ organizationId }, dueFollowUpWhere()] },
    orderBy: { followUpDate: "asc" },
    select: {
      id: true,
      studentName: true,
      phone: true,
      interestedIn: true,
      status: true,
      followUpDate: true,
      createdAt: true,
    },
  });

  const grouped = new Map<FollowUpTone, EnquiryRow[]>();
  for (const enquiry of enquiries) {
    const { tone } = formatFollowUp(enquiry.followUpDate);
    grouped.set(tone, [...(grouped.get(tone) ?? []), enquiry]);
  }

  return (
    <div className="space-y-6">
      <EnquiriesHeader />

      {enquiries.length === 0 ? (
        <div className="flex min-h-60 items-center justify-center rounded-xl border border-dashed border-border bg-card">
          <p className="text-sm text-muted-foreground">
            Nothing due today. Follow-ups appear here on the day they&apos;re set.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {GROUPS.filter((group) => (grouped.get(group.tone)?.length ?? 0) > 0).map((group) => (
            <div key={group.tone} className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {group.label}{" "}
                <span className="text-muted-foreground/70">
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
