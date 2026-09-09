import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircleIcon, PencilIcon, PhoneIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/lib/auth/org-context";
import { formatDate, formatDateTime, telHref, whatsAppHref } from "@/lib/enquiries";
import { getDictionary } from "@/lib/i18n/server";
import { intlLocale } from "@/lib/i18n/locales";
import { fill } from "@/lib/i18n/format";
import { formatInr } from "@/lib/money";
import { ageInYears, studentName } from "@/lib/students";
import { Button } from "@/components/ui/button";
import { BackLink } from "@/components/enquiries/back-link";

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

  // The parent's number is the one that gets dialled — the student rarely has
  // their own, and a child's number is not the one an academy calls about fees.
  const callablePhone = student.parent?.phone ?? student.phone;

  const dateOfBirth = student.dateOfBirth
    ? `${formatDate(student.dateOfBirth, intl)} · ${fill(t.students.detail.years, {
        count: ageInYears(student.dateOfBirth),
      })}`
    : null;

  const studentFields = [
    { label: t.students.detail.phone, value: student.phone },
    { label: t.students.detail.email, value: student.email },
    { label: t.students.detail.dateOfBirth, value: dateOfBirth },
    {
      label: t.students.detail.experience,
      value: student.experience ? t.enquiries.experience[student.experience] : null,
    },
    { label: t.students.detail.address, value: student.address },
  ];
  const known = studentFields.filter((field) => Boolean(field.value));
  const missing = studentFields.filter((field) => !field.value).map((field) => field.label);

  const parentFields = student.parent
    ? [
        { label: t.students.detail.name, value: student.parent.name },
        { label: t.students.detail.phone, value: student.parent.phone },
        { label: t.students.detail.email, value: student.parent.email },
      ].filter((field) => Boolean(field.value))
    : [];

  return (
    <div className="space-y-6">
      <BackLink href="/students" label={t.students.detail.back} />

      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <h2 className="text-2xl font-semibold text-foreground">{studentName(student)}</h2>
          <Button
            variant="outline"
            size="lg"
            nativeButton={false}
            render={<Link href={`/students/${student.id}/edit`} />}
          >
            <PencilIcon aria-hidden="true" />
            {t.common.edit}
          </Button>
        </div>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {fill(t.students.detail.admittedOn, {
            date: formatDateTime(student.createdAt, intl),
          })}
          {student.convertedFromEnquiry && (
            <>
              {" · "}
              <Link
                href={`/enquiries/${student.convertedFromEnquiry.id}`}
                className="font-medium text-primary hover:underline"
              >
                {fill(t.students.detail.fromEnquiry, {
                  date: formatDate(student.convertedFromEnquiry.createdAt, intl),
                })}
              </Link>
            </>
          )}
        </p>

        {callablePhone && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
            <Button
              variant="outline"
              size="lg"
              nativeButton={false}
              render={<a href={telHref(callablePhone)} />}
            >
              <PhoneIcon aria-hidden="true" />
              {t.enquiries.row.call} · {callablePhone}
            </Button>
            <Button
              variant="outline"
              size="lg"
              nativeButton={false}
              render={
                <a
                  href={whatsAppHref(callablePhone)}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              <MessageCircleIcon aria-hidden="true" />
              {t.enquiries.row.whatsapp}
            </Button>
          </div>
        )}

        {/* Known facts across the card, then one line for what is missing —
            rather than a column of em-dashes where the eye expects content. */}
        <div className="mt-4 border-t border-border pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t.students.detail.student}
          </h3>
          {known.length > 0 && (
            <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
              {known.map((field) => (
                <div key={field.label}>
                  <dt className="text-xs text-muted-foreground">{field.label}</dt>
                  <dd className="mt-0.5 wrap-break-word text-sm font-medium text-foreground">
                    {field.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          {missing.length > 0 && (
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              {fill(t.students.detail.notRecorded, { fields: missing.join(", ") })}{" "}
              <Link
                href={`/students/${student.id}/edit`}
                className="font-medium text-primary hover:underline"
              >
                {t.common.edit}
              </Link>
            </p>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title={t.students.detail.parent}>
          {parentFields.length > 0 ? (
            <>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
                {parentFields.map((field) => (
                  <div key={field.label}>
                    <dt className="text-xs text-muted-foreground">{field.label}</dt>
                    <dd className="mt-0.5 wrap-break-word text-sm font-medium text-foreground">
                      {field.value}
                    </dd>
                  </div>
                ))}
              </dl>
              {siblings.length > 0 && (
                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {t.students.title}
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
            <p className="text-sm text-muted-foreground">{t.common.none}</p>
          )}
        </Panel>

        <Panel title={t.students.detail.batches}>
          {student.enrollments.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t.students.detail.noBatches}</p>
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
                      {enrollment.batch.teacher?.name ?? t.common.notSet} ·{" "}
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
      </div>

      <Panel
        title={t.students.detail.payments}
        aside={
          paidTotal > 0 ? (
            <span className="text-sm text-muted-foreground">
              {fill(t.students.detail.received, { amount: formatInr(paidTotal) })}
            </span>
          ) : null
        }
      >
        {student.payments.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.students.detail.noPayments}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-120 text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">{t.students.detail.paymentType}</th>
                  <th className="py-2 pr-4 font-medium">{t.students.detail.paymentAmount}</th>
                  <th className="py-2 pr-4 font-medium">{t.students.detail.paymentStatus}</th>
                  <th className="py-2 font-medium">{t.students.detail.paymentDate}</th>
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
                    <td className="py-2 whitespace-nowrap text-muted-foreground">
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
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {aside}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
