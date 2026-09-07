import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/lib/auth/org-context";
import { EXPERIENCE_LABELS, formatDateTime } from "@/lib/enquiries";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/enquiries/status-badge";
import { EnquiryUpdateForm } from "@/components/enquiries/enquiry-update-form";

export default async function EnquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Always scoped. `findUnique({ where: { id } })` here would be a cross-tenant
  // read waiting to happen.
  const { organizationId } = await requireOrgContext();
  const enquiry = await prisma.enquiry.findFirst({
    where: { id, organizationId },
    include: {
      convertedStudent: { select: { id: true, firstName: true, lastName: true } },
      course: { select: { name: true } },
      noteEntries: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          body: true,
          createdAt: true,
          author: { select: { name: true } },
        },
      },
    },
  });
  if (!enquiry) notFound();

  const converted = enquiry.convertedStudent;
  const convertedName = converted
    ? [converted.firstName, converted.lastName].filter(Boolean).join(" ")
    : null;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/enquiries"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          ← Back to enquiries
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-semibold text-foreground">{enquiry.studentName}</h2>
            <StatusBadge status={enquiry.status} />
          </div>
          {!converted && (
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href={`/enquiries/${enquiry.id}/convert`} />}
            >
              Convert to student
            </Button>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Enquiry received {formatDateTime(enquiry.createdAt)}
        </p>
      </div>

      {converted && (
        <div className="rounded-xl border border-[#27af90]/40 bg-[#27af90]/10 p-4 text-sm text-foreground">
          Admitted as <span className="font-semibold">{convertedName}</span>. The student and
          parent records exist; they&apos;ll be browsable once Students is built.
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-fit rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground">Details</h3>
          <dl className="mt-4 space-y-4 text-sm">
            <DetailRow label="Phone" value={enquiry.phone} />
            <DetailRow label="Email" value={enquiry.email} />
            <DetailRow label="Parent / guardian" value={enquiry.parentName} />
            <DetailRow label="Interested in" value={enquiry.interestedIn} />
            <DetailRow label="Course" value={enquiry.course?.name ?? null} />
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

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground">Notes</h3>
        {enquiry.noteEntries.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            No notes yet. Add one above — every note is kept, newest first.
          </p>
        ) : (
          <ol className="mt-4 space-y-4">
            {enquiry.noteEntries.map((note) => (
              <li key={note.id} className="border-l-2 border-border pl-4">
                <p className="whitespace-pre-wrap text-sm text-foreground">{note.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDateTime(note.createdAt)}
                  {note.author ? ` · ${note.author.name}` : ""}
                </p>
              </li>
            ))}
          </ol>
        )}
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
