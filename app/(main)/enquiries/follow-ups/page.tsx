import { requireOrgContext } from "@/lib/auth/org-context";
import { dueFollowUpWhere, ROW_SELECT } from "@/lib/enquiries-query";
import { listCourseOptions } from "@/lib/courses-query";
import { followUpTone, type FollowUpTone } from "@/lib/enquiries";
import { getDictionary } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/enquiries/back-link";
import { EnquiriesHeader } from "@/components/enquiries/enquiries-header";
import { EnquiriesTable, type EnquiryRow } from "@/components/enquiries/enquiries-table";

export const dynamic = "force-dynamic";

// Only what is actually due — overdue and today. A follow-up set for next week
// is not this morning's work, and an admitted or lost enquiry is never work.
const GROUPS: FollowUpTone[] = ["overdue", "today"];

export default async function FollowUpsPage() {
  const { organizationId } = await requireOrgContext();

  const [enquiries, courses, { t }] = await Promise.all([
    prisma.enquiry.findMany({
      where: { AND: [{ organizationId }, dueFollowUpWhere()] },
      orderBy: { followUpDate: "asc" },
      select: ROW_SELECT,
    }),
    listCourseOptions(organizationId),
    getDictionary(),
  ]);

  const grouped = new Map<FollowUpTone, EnquiryRow[]>();
  for (const enquiry of enquiries) {
    const tone = followUpTone(enquiry.followUpDate);
    grouped.set(tone, [...(grouped.get(tone) ?? []), enquiry]);
  }

  const headings: Record<FollowUpTone, string> = {
    overdue: t.followUps.overdue,
    today: t.followUps.today,
    tomorrow: t.enquiries.followUp.tomorrow,
    upcoming: t.enquiries.followUp.none,
    none: t.enquiries.followUp.none,
  };

  return (
    <div className="space-y-6">
      <BackLink href="/enquiries" label={t.enquiries.backToList} />

      <EnquiriesHeader courses={courses} dueCount={enquiries.length} />

      {enquiries.length === 0 ? (
        <div className="flex min-h-60 items-center justify-center rounded-xl border border-dashed border-border bg-card">
          <div className="max-w-sm px-6 text-center">
            <p className="text-sm font-medium text-foreground">{t.followUps.empty}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t.followUps.emptyHint}</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {GROUPS.filter((tone) => (grouped.get(tone)?.length ?? 0) > 0).map((tone) => (
            <div key={tone} className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {headings[tone]}{" "}
                <span className="text-muted-foreground/70">({grouped.get(tone)?.length})</span>
              </h3>
              <EnquiriesTable enquiries={grouped.get(tone) ?? []} courses={courses} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
