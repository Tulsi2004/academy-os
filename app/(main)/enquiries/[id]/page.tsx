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
          className="text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← Back to enquiries
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {enquiry.studentName}
          </h2>
          <StatusBadge status={enquiry.status} />
        </div>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Enquiry received {formatDateTime(enquiry.createdAt)}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-fit rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Details</h3>
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

        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Update enquiry
          </h3>
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
      <dt className="text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="text-right font-medium text-zinc-900 dark:text-zinc-50">{value || "—"}</dd>
    </div>
  );
}
