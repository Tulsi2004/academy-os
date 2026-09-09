import Link from "next/link";
import { notFound } from "next/navigation";
import { GraduationCapIcon, MessageCircleIcon, PhoneIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/lib/auth/org-context";
import { formatDateTime, telHref, whatsAppHref } from "@/lib/enquiries";
import { getDictionary } from "@/lib/i18n/server";
import { intlLocale } from "@/lib/i18n/locales";
import { fill } from "@/lib/i18n/format";
import { Button } from "@/components/ui/button";
import { BackLink } from "@/components/enquiries/back-link";
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
  const [enquiry, { locale, t }] = await Promise.all([
    prisma.enquiry.findFirst({
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
    }),
    getDictionary(),
  ]);
  if (!enquiry) notFound();

  const intl = intlLocale(locale);
  const converted = enquiry.convertedStudent;
  const convertedName = converted
    ? [converted.firstName, converted.lastName].filter(Boolean).join(" ")
    : null;

  /*
    The phone is deliberately absent: it is already the label on the Call button
    a few centimetres above, and repeating it here made the one fact every
    enquiry has look like the only thing worth showing.
  */
  const fields = [
    { label: t.enquiries.detail.email, value: enquiry.email },
    { label: t.enquiries.detail.parent, value: enquiry.parentName },
    { label: t.enquiries.detail.interestedIn, value: enquiry.interestedIn },
    { label: t.enquiries.detail.course, value: enquiry.course?.name ?? null },
    {
      label: t.enquiries.detail.experience,
      value: enquiry.experience ? t.enquiries.experience[enquiry.experience] : null,
    },
  ];
  const known = fields.filter((field) => Boolean(field.value));
  const missing = fields.filter((field) => !field.value).map((field) => field.label);

  return (
    <div className="space-y-6">
      <BackLink href="/enquiries" label={t.enquiries.backToList} />

      {/*
        Who they are, how to reach them, and what is known — one card, laid out
        across the page. As a tall sidebar this was mostly blank space beside a
        much taller column, because a fresh enquiry is a name and a number and
        nothing else yet.
      */}
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-semibold text-foreground">{enquiry.studentName}</h2>
              <StatusBadge status={enquiry.status} />
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {fill(t.enquiries.detail.receivedOn, {
                date: formatDateTime(enquiry.createdAt, intl),
              })}
              {" · "}
              {t.enquiries.detail.lastUpdated}: {formatDateTime(enquiry.updatedAt, intl)}
            </p>
          </div>
          {!converted && (
            <Button
              size="lg"
              className="shadow-sm"
              nativeButton={false}
              render={<Link href={`/enquiries/${enquiry.id}/convert`} />}
            >
              <GraduationCapIcon aria-hidden="true" />
              {t.enquiries.detail.convert}
            </Button>
          )}
        </div>

        {/* The two things anyone does from this page before reading anything
            else, so they sit above the fold at full button size. */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <Button
            variant="outline"
            size="lg"
            nativeButton={false}
            render={<a href={telHref(enquiry.phone)} />}
          >
            <PhoneIcon aria-hidden="true" />
            {t.enquiries.row.call} · {enquiry.phone}
          </Button>
          <Button
            variant="outline"
            size="lg"
            nativeButton={false}
            render={
              <a
                href={whatsAppHref(enquiry.phone)}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <MessageCircleIcon aria-hidden="true" />
            {t.enquiries.row.whatsapp}
          </Button>
        </div>

        <div className="mt-4 border-t border-border pt-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t.enquiries.detail.details}
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
              {fill(t.enquiries.detail.notRecorded, { fields: missing.join(", ") })}
            </p>
          )}
        </div>
      </section>

      {converted && (
        <div className="rounded-xl border border-[#27af90]/40 bg-[#27af90]/10 p-4 text-sm text-foreground">
          {fill(t.enquiries.detail.joinedAs, { name: convertedName ?? "" })}{" "}
          <Link
            href={`/students/${converted.id}`}
            className="font-medium text-primary hover:underline"
          >
            {t.enquiries.detail.openStudent}
          </Link>
        </div>
      )}

      {/*
        Side by side because they are two halves of the same habit: you write
        what just happened on the left, against everything that happened before
        on the right.
      */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-base font-semibold text-foreground">
            {t.enquiries.detail.update}
          </h3>
          <div className="mt-4">
            <EnquiryUpdateForm enquiry={enquiry} />
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-base font-semibold text-foreground">
            {t.enquiries.detail.history}
          </h3>
          {enquiry.noteEntries.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">{t.enquiries.detail.noHistory}</p>
          ) : (
            <ol className="mt-4 space-y-4">
              {enquiry.noteEntries.map((note) => (
                <li key={note.id} className="border-l-2 border-primary/30 pl-4">
                  <p className="whitespace-pre-wrap text-sm text-foreground">{note.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDateTime(note.createdAt, intl)}
                    {note.author ? ` · ${note.author.name}` : ""}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}
