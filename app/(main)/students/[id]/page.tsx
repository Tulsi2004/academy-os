import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/lib/auth/org-context";
import { formatDate, formatDateTime } from "@/lib/enquiries";
import { getDictionary } from "@/lib/i18n/server";
import { intlLocale } from "@/lib/i18n/locales";
import { formatInr } from "@/lib/money";
import { formatDateOfBirth, studentName } from "@/lib/students";

export const dynamic = "force-dynamic";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Always scoped. `findUnique({ where: { id } })` here would be a cross-tenant
  // read waiting to happen.
  const { organizationId } = await requireOrgContext();
  const { locale, t } = await getDictionary();
  const intl = intlLocale(locale);
  const student = await prisma.student.findFirst({
    where: { id, organizationId },
    include: {
      parent: { select: { id: true, name: true, phone: true, email: true } },
      convertedFromEnquiry: { select: { id: true, createdAt: true } },
      enrollments: {
        orderBy: { enrolledAt: "desc" },
        select: {
          id: true,
          status: true,
          enrolledAt: true,
          batch: {
            select: {
              id: true,
              name: true,
              course: { select: { name: true } },
              teacher: { select: { name: true } },
            },
          },
        },
      },
      payments: {
        orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          type: true,
          amount: true,
          status: true,
          paidAt: true,
          createdAt: true,
        },
      },
    },
  });
  if (!student) notFound();

  /*
    Siblings. Indian academies enrol brothers and sisters constantly and think
    of them as one family on one phone number — showing them together here is
    the first step toward the global phone lookup the whole product points at.
  */
  const siblings = student.parentId
    ? await prisma.student.findMany({
        where: { organizationId, parentId: student.parentId, id: { not: student.id } },
        orderBy: { createdAt: "desc" },
        select: { id: true, firstName: true, lastName: true },
      })
    : [];

  const paidTotal = student.payments
    .filter((payment) => payment.status === "PAID")
    .reduce((sum, payment) => sum + Number(payment.amount.toString()), 0);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/students"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          ← Back to students
        </Link>
        <h2 className="mt-2 text-2xl font-semibold text-foreground">{studentName(student)}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Admitted {formatDateTime(student.createdAt, intl)}
          {student.convertedFromEnquiry && (
            <>
              {" · "}
              <Link
                href={`/enquiries/${student.convertedFromEnquiry.id}`}
                className="font-medium text-primary hover:underline"
              >
                from an enquiry on {formatDate(student.convertedFromEnquiry.createdAt, intl)}
              </Link>
            </>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="Student">
          <dl className="space-y-4 text-sm">
            <DetailRow label="Phone" value={student.phone} />
            <DetailRow label="Email" value={student.email} />
            <DetailRow
              label="Date of birth"
              value={student.dateOfBirth ? formatDateOfBirth(student.dateOfBirth) : null}
            />
            <DetailRow
              label="Experience"
              value={student.experience ? t.enquiries.experience[student.experience] : null}
            />
            <DetailRow label="Address" value={student.address} />
          </dl>
        </Panel>

        <Panel title="Parent / guardian">
          {student.parent ? (
            <>
              <dl className="space-y-4 text-sm">
                <DetailRow label="Name" value={student.parent.name} />
                <DetailRow label="Phone" value={student.parent.phone} />
                <DetailRow label="Email" value={student.parent.email} />
              </dl>
              {siblings.length > 0 && (
                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Also enrolled
                  </p>
                  <ul className="mt-2 space-y-1">
                    {siblings.map((sibling) => (
                      <li key={sibling.id}>
                        <Link
                          href={`/students/${sibling.id}`}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          {studentName(sibling)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No parent on file.</p>
          )}
        </Panel>
      </div>

      <Panel title="Batches">
        {student.enrollments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Not enrolled in a batch yet. Batches can be assigned once that module is built.
          </p>
        ) : (
          <ul className="space-y-3">
            {student.enrollments.map((enrollment) => (
              <li
                key={enrollment.id}
                className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {enrollment.batch.course.name} — {enrollment.batch.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {enrollment.batch.teacher?.name ?? "No teacher assigned"} · enrolled{" "}
                    {formatDate(enrollment.enrolledAt, intl)}
                  </p>
                </div>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {enrollment.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel
        title="Payments"
        aside={
          paidTotal > 0 ? (
            <span className="text-sm text-muted-foreground">{formatInr(paidTotal)} received</span>
          ) : null
        }
      >
        {student.payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No payments recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-120 text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Type</th>
                  <th className="py-2 pr-4 font-medium">Amount</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {student.payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="py-2 pr-4 text-foreground">{payment.type}</td>
                    <td className="py-2 pr-4 font-medium text-foreground">
                      {formatInr(payment.amount)}
                    </td>
                    <td className="py-2 pr-4 text-muted-foreground">{payment.status}</td>
                    <td className="py-2 text-muted-foreground">
                      {formatDate(payment.paidAt ?? payment.createdAt, intl)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

function Panel({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="h-fit rounded-xl border border-border bg-card p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {aside}
      </div>
      <div className="mt-4">{children}</div>
    </section>
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
