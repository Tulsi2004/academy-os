import { notFound, redirect } from "next/navigation";
import { requireOrgContext } from "@/lib/auth/org-context";
import { getDictionary } from "@/lib/i18n/server";
import { fill } from "@/lib/i18n/format";
import { prisma } from "@/lib/prisma";
import { BackLink } from "@/components/enquiries/back-link";
import {
  StudentIntakeForm,
  type BatchOption,
} from "@/components/students/student-intake-form";
import { convertEnquiry } from "@/lib/actions/conversion";

export default async function ConvertEnquiryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { organizationId } = await requireOrgContext();
  const { t } = await getDictionary();

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
        <BackLink
          href={`/enquiries/${enquiry.id}`}
          label={t.enquiries.convert.back}
        />
        <h2 className="mt-2 text-2xl font-semibold text-foreground">
          {fill(t.enquiries.convert.title, { name: enquiry.studentName })}
        </h2>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          {t.enquiries.convert.subtitle}
        </p>
      </div>

      <StudentIntakeForm
        // Bound here so the enquiry id never travels as a form field — a
        // caller-supplied id in the body would be a tenancy hole.
        submit={convertEnquiry.bind(null, enquiry.id)}
        submitLabel={t.enquiries.convert.submit}
        submittingLabel={t.enquiries.convert.submitting}
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
