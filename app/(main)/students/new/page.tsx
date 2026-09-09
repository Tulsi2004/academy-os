import { requireOrgContext } from "@/lib/auth/org-context";
import { prisma } from "@/lib/prisma";
import { createStudent } from "@/lib/actions/students";
import { getDictionary } from "@/lib/i18n/server";
import { BackLink } from "@/components/enquiries/back-link";
import {
  StudentIntakeForm,
  type BatchOption,
} from "@/components/students/student-intake-form";

/*
  The way an academy gets its existing roll into the product. Everyone already
  attending predates the software, so without this page the only route to a
  Student record is through an enquiry that never happened.
*/
export default async function NewStudentPage() {
  const { organizationId } = await requireOrgContext();
  const [batchRows, { t }] = await Promise.all([
    prisma.batch.findMany({
      where: { organizationId, active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, course: { select: { name: true } } },
    }),
    getDictionary(),
  ]);

  const batches: BatchOption[] = batchRows.map((batch) => ({
    id: batch.id,
    label: `${batch.course.name} — ${batch.name}`,
  }));

  return (
    <div className="space-y-6">
      <BackLink href="/students" label={t.students.detail.back} />

      <div>
        <h2 className="text-2xl font-semibold text-foreground">{t.students.new.title}</h2>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">
          {t.students.new.subtitle}
        </p>
      </div>

      <StudentIntakeForm
        submit={createStudent}
        submitLabel={t.students.new.submit}
        submittingLabel={t.students.new.submitting}
        batches={batches}
        cancelHref="/students"
        // Nothing to carry over: nobody enquired, so every field starts empty
        // and none of them get the "from the enquiry" tag.
      />
    </div>
  );
}
