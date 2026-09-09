import { notFound } from "next/navigation";
import { requireOrgContext } from "@/lib/auth/org-context";
import { prisma } from "@/lib/prisma";
import { updateStudent } from "@/lib/actions/students";
import { getDictionary } from "@/lib/i18n/server";
import { fill } from "@/lib/i18n/format";
import { studentName } from "@/lib/students";
import { BackLink } from "@/components/enquiries/back-link";
import { StudentIntakeForm } from "@/components/students/student-intake-form";

function toDateInputValue(date: Date | null) {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Always scoped — `findUnique({ where: { id } })` here would be a
  // cross-tenant read waiting to happen.
  const { organizationId } = await requireOrgContext();
  const [student, { t }] = await Promise.all([
    prisma.student.findFirst({
      where: { id, organizationId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        experience: true,
        address: true,
        phone: true,
        email: true,
        parent: { select: { name: true, phone: true, email: true } },
      },
    }),
    getDictionary(),
  ]);
  if (!student) notFound();

  return (
    <div className="space-y-6">
      <BackLink href={`/students/${student.id}`} label={t.students.detail.back} />

      <div>
        <h2 className="text-2xl font-semibold text-foreground">
          {fill(t.students.edit.title, { name: studentName(student) })}
        </h2>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          {t.students.edit.subtitle}
        </p>
      </div>

      <StudentIntakeForm
        submit={updateStudent.bind(null, student.id)}
        submitLabel={t.students.edit.submit}
        submittingLabel={t.students.edit.submitting}
        cancelHref={`/students/${student.id}`}
        // A batch enrolment and a registration fee are events, not details —
        // re-submitting them here would enrol the student twice.
        showEnrolment={false}
        batches={[]}
        initial={{
          firstName: student.firstName,
          lastName: student.lastName ?? "",
          dateOfBirth: toDateInputValue(student.dateOfBirth),
          experience: student.experience ?? "",
          address: student.address ?? "",
          studentPhone: student.phone ?? "",
          studentEmail: student.email ?? "",
          parentName: student.parent?.name ?? "",
          parentPhone: student.parent?.phone ?? "",
          parentEmail: student.parent?.email ?? "",
        }}
      />
    </div>
  );
}
