import Link from "next/link";
import { EnquiryStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentOrganization } from "@/lib/current-org";
import { ENQUIRY_STATUS_LABELS } from "@/lib/enquiries";
import { EnquiriesHeader } from "@/components/enquiries/enquiries-header";
import { EnquiriesTable } from "@/components/enquiries/enquiries-table";

const STATUS_FILTERS = Object.values(EnquiryStatus);

export default async function EnquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeStatus = STATUS_FILTERS.includes(status as EnquiryStatus)
    ? (status as EnquiryStatus)
    : undefined;

  const organization = await getCurrentOrganization();

  const enquiries = await prisma.enquiry.findMany({
    where: {
      organizationId: organization.id,
      ...(activeStatus ? { status: activeStatus } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      studentName: true,
      phone: true,
      interestedIn: true,
      status: true,
      followUpDate: true,
    },
  });

  return (
    <div className="space-y-6">
      <EnquiriesHeader />

      <div className="flex flex-wrap items-center gap-2">
        <FilterChip href="/enquiries" active={!activeStatus} label="All" />
        {STATUS_FILTERS.map((s) => (
          <FilterChip
            key={s}
            href={`/enquiries?status=${s}`}
            active={activeStatus === s}
            label={ENQUIRY_STATUS_LABELS[s]}
          />
        ))}
      </div>

      <EnquiriesTable enquiries={enquiries} />
    </div>
  );
}

function FilterChip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:bg-muted"
      }`}
    >
      {label}
    </Link>
  );
}
