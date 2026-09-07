import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireOrgContext } from "@/lib/auth/org-context";
import { prisma } from "@/lib/prisma";
import { ConvertForm, type BatchOption } from "@/components/enquiries/convert-form";

export default async function ConvertEnquiryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId } = await requireOrgContext();

  const enquiry = await prisma.enquiry.findFirst({
    where: { id, organizationId },
    select: {
      id: true,
      studentName: true,
      parentName: true,
      phone: true,
      experience: true,
      convertedStudentId: true,
    },
  });
  if (!enquiry) notFound();

  // Converting twice would create a second Student for the same person. The
  // action refuses it too; this just avoids showing a form that cannot succeed.
  if (enquiry.convertedStudentId) redirect(`/enquiries/${enquiry.id}`);

  const batchRows = await prisma.batch.findMany({
    where: { organizationId, active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, course: { select: { name: true } } },
  });
  const batches: BatchOption[] = batchRows.map((batch) => ({
    id: batch.id,
    label: `${batch.course.name} — ${batch.name}`,
  }));

  const [firstName, ...restOfName] = enquiry.studentName.trim().split(/\s+/);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/enquiries/${enquiry.id}`}
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          ← Back to enquiry
        </Link>
        <h2 className="mt-2 text-2xl font-semibold text-foreground">
          Convert {enquiry.studentName}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          This creates the student and parent records and closes the enquiry as admitted.
        </p>
      </div>

      <ConvertForm
        enquiryId={enquiry.id}
        batches={batches}
        defaults={{
          firstName: firstName ?? "",
          lastName: restOfName.join(" "),
          parentName: enquiry.parentName ?? "",
          parentPhone: enquiry.phone,
          experience: enquiry.experience ?? "",
        }}
      />
    </div>
  );
}
