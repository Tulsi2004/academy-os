import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/current-org";
import { EXPERIENCE_LABELS, formatDateTime } from "@/lib/enquiries";
import { StatusBadge } from "@/components/enquiries/status-badge";
import { EnquiryUpdateForm } from "@/components/enquiries/enquiry-update-form";

export default async function EnquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const organization = await getCurrentOrganization();
  const enquiry = await prisma.enquiry.findFirst({
    where: { id, organizationId: organization.id },
  });
  if (!enquiry) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/enquiries"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          ← Back to enquiries
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-semibold text-foreground">{enquiry.studentName}</h2>
          <StatusBadge status={enquiry.status} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Enquiry received {formatDateTime(enquiry.createdAt)}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-fit rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground">Details</h3>
          <dl className="mt-4 space-y-4 text-sm">
            <DetailRow label="Phone" value={enquiry.phone} />
            <DetailRow label="Email" value={enquiry.email} />
            <DetailRow label="Parent / guardian" value={enquiry.parentName} />
            <DetailRow label="Interested in" value={enquiry.interestedIn} />
            <DetailRow
              label="Experience"
              value={enquiry.experience ? EXPERIENCE_LABELS[enquiry.experience] : null}
            />
            <DetailRow label="Last updated" value={formatDateTime(enquiry.updatedAt)} />
          </dl>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground">Update enquiry</h3>
          <div className="mt-4">
            <EnquiryUpdateForm enquiry={enquiry} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium text-foreground">{value || "—"}</dd>
    </div>
  );
}
