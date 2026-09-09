import { notFound } from "next/navigation";
import { requireOrgContext } from "@/lib/auth/org-context";
import { prisma } from "@/lib/prisma";
import { listCourseOptions } from "@/lib/courses-query";
import { getDictionary } from "@/lib/i18n/server";
import { fill } from "@/lib/i18n/format";
import { BackLink } from "@/components/enquiries/back-link";
import { EnquiryDetailsForm } from "@/components/enquiries/enquiry-details-form";

export default async function EditEnquiryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Always scoped — `findUnique({ where: { id } })` here would be a
  // cross-tenant read waiting to happen.
  const { organizationId } = await requireOrgContext();
  const [enquiry, courses, { t }] = await Promise.all([
    prisma.enquiry.findFirst({
      where: { id, organizationId },
      select: {
        id: true,
        studentName: true,
        phone: true,
        email: true,
        parentName: true,
        interestedIn: true,
        courseId: true,
        experience: true,
      },
    }),
    listCourseOptions(organizationId),
    getDictionary(),
  ]);
  if (!enquiry) notFound();

  return (
    <div className="space-y-6">
      <BackLink href={`/enquiries/${enquiry.id}`} label={t.enquiries.backToList} />

      <div>
        <h2 className="text-2xl font-semibold text-foreground">
          {fill(t.enquiries.editDetails.title, { name: enquiry.studentName })}
        </h2>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          {t.enquiries.editDetails.subtitle}
        </p>
      </div>

      <EnquiryDetailsForm
        enquiryId={enquiry.id}
        courses={courses}
        initial={{
          studentName: enquiry.studentName,
          phone: enquiry.phone,
          email: enquiry.email ?? "",
          parentName: enquiry.parentName ?? "",
          interestedIn: enquiry.interestedIn ?? "",
          courseId: enquiry.courseId ?? "",
          experience: enquiry.experience ?? "",
        }}
      />
    </div>
  );
}
