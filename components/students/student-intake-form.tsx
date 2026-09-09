"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircleIcon, GraduationCapIcon } from "lucide-react";
import { studentIntakeSchema } from "@/lib/validations/conversion";
import { blurErrorFor, fieldErrorsOf } from "@/lib/validations/client";
import { EXPERIENCE_OPTIONS } from "@/lib/enquiries";
import { useLanguage } from "@/lib/i18n/language-provider";
import { translateFieldErrors, translateMessage } from "@/lib/i18n/messages";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type BatchOption = { id: string; label: string };

export type IntakeValues = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  experience: string;
  address: string;
  studentPhone: string;
  studentEmail: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  batchId: string;
  registrationFee: string;
};

const EMPTY: IntakeValues = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  experience: "",
  address: "",
  studentPhone: "",
  studentEmail: "",
  parentName: "",
  parentPhone: "",
  parentEmail: "",
  batchId: "",
  registrationFee: "",
};

export type IntakeResult =
  | { ok: true; studentId: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

/*
  One form, two ways in: admitting an enquiry, and entering someone who has been
  coming to class since before the academy had software. The fields are the same
  because the Student and Parent rows they produce are the same — so the action
  arrives as a prop rather than the form knowing which journey it is on.
*/
export function StudentIntakeForm({
  initial,
  prefilled = [],
  batches,
  submit: runSubmit,
  submitLabel,
  submittingLabel,
  showEnrolment = true,
  cancelHref,
}: {
  /** Whatever is already known — from the enquiry, or from the record being edited. */
  initial?: Partial<IntakeValues>;
  /*
    Which of those came from the enquiry, and so should be tagged rather than
    read as a question being asked twice. Empty when editing: the values are the
    record's own, not carried over from anywhere.
  */
  prefilled?: (keyof IntakeValues)[];
  batches: BatchOption[];
  submit: (values: Record<string, string>) => Promise<IntakeResult>;
  submitLabel: string;
  submittingLabel: string;
  /*
    Off when editing. A batch enrolment and a registration fee describe things
    that happened once; re-submitting them on every edit would enrol the student
    a second time and take the fee again.
  */
  showEnrolment?: boolean;
  cancelHref?: string;
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const [values, setValues] = useState<IntakeValues>({ ...EMPTY, ...initial });
  const isPrefilled = (field: keyof IntakeValues) => prefilled.includes(field);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function set(key: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: "" }));
  }

  function checkField(field: string) {
    const message = blurErrorFor(studentIntakeSchema, values, field, t);
    setFieldErrors((current) => ({ ...current, [field]: message }));
  }

  async function submit() {
    const clientErrors = fieldErrorsOf(studentIntakeSchema, values, t);
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setError(null);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const result = await runSubmit(values);
      if (!result.ok) {
        setError(translateMessage(result.error, t));
        setFieldErrors(translateFieldErrors(result.fieldErrors, t));
        return;
      }
      // Land on the record — freshly created, or the one just edited.
      router.push(`/students/${result.studentId}`);
      router.refresh();
    } catch {
      setError(t.errors.convertFailed);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <Section title={t.enquiries.convert.studentSection} hint={t.enquiries.convert.studentHint}>
        <FieldWrap
          label={t.enquiries.convert.firstName}
          error={fieldErrors.firstName}
          required
          prefilled={isPrefilled("firstName")}
        >
          <Input
            value={values.firstName}
            onChange={(e) => set("firstName", e.target.value)}
            onBlur={() => checkField("firstName")}
            aria-invalid={Boolean(fieldErrors.firstName)}
          />
        </FieldWrap>
        <FieldWrap
          label={t.enquiries.convert.lastName}
          error={fieldErrors.lastName}
          prefilled={isPrefilled("lastName")}
        >
          <Input value={values.lastName} onChange={(e) => set("lastName", e.target.value)}
            onBlur={() => checkField("lastName")} />
        </FieldWrap>
        <FieldWrap label={t.enquiries.convert.dateOfBirth} error={fieldErrors.dateOfBirth}>
          <Input
            type="date"
            value={values.dateOfBirth}
            onChange={(e) => set("dateOfBirth", e.target.value)}
            onBlur={() => checkField("dateOfBirth")}
          />
        </FieldWrap>
        <FieldWrap
          label={t.enquiries.convert.experience}
          error={fieldErrors.experience}
          prefilled={isPrefilled("experience")}
        >
          <Select
            value={values.experience || null}
            onValueChange={(value) => set("experience", (value as string) ?? "")}
          >
            <SelectTrigger className="h-9 w-full">
              <SelectValue>
                {(value: string | null) =>
                  value
                    ? t.enquiries.experience[value as keyof typeof t.enquiries.experience]
                    : t.common.notSet
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {EXPERIENCE_OPTIONS.map((level) => (
                <SelectItem key={level} value={level}>
                  {t.enquiries.experience[level]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldWrap>
        <FieldWrap label={t.enquiries.convert.studentPhone} error={fieldErrors.studentPhone}>
          <Input
            type="tel"
            inputMode="numeric"
            value={values.studentPhone}
            onChange={(e) => set("studentPhone", e.target.value)}
            onBlur={() => checkField("studentPhone")}
            aria-invalid={Boolean(fieldErrors.studentPhone)}
          />
        </FieldWrap>
        <FieldWrap label={t.enquiries.convert.studentEmail} error={fieldErrors.studentEmail}>
          <Input
            type="email"
            value={values.studentEmail}
            onChange={(e) => set("studentEmail", e.target.value)}
            onBlur={() => checkField("studentEmail")}
            aria-invalid={Boolean(fieldErrors.studentEmail)}
          />
        </FieldWrap>
        <FieldWrap label={t.enquiries.convert.address} error={fieldErrors.address} wide>
          <Textarea
            rows={2}
            value={values.address}
            onChange={(e) => set("address", e.target.value)}
            onBlur={() => checkField("address")}
          />
        </FieldWrap>
      </Section>

      <Section title={t.enquiries.convert.parentSection} hint={t.enquiries.convert.parentHint}>
        <FieldWrap
          label={t.enquiries.convert.parentName}
          error={fieldErrors.parentName}
          required
          prefilled={isPrefilled("parentName")}
        >
          <Input
            value={values.parentName}
            onChange={(e) => set("parentName", e.target.value)}
            onBlur={() => checkField("parentName")}
            aria-invalid={Boolean(fieldErrors.parentName)}
          />
        </FieldWrap>
        <FieldWrap
          label={t.enquiries.convert.parentPhone}
          error={fieldErrors.parentPhone}
          required
          prefilled={isPrefilled("parentPhone")}
        >
          <Input
            type="tel"
            inputMode="numeric"
            value={values.parentPhone}
            onChange={(e) => set("parentPhone", e.target.value)}
            onBlur={() => checkField("parentPhone")}
            aria-invalid={Boolean(fieldErrors.parentPhone)}
          />
        </FieldWrap>
        <FieldWrap label={t.enquiries.convert.parentEmail} error={fieldErrors.parentEmail}>
          <Input
            type="email"
            value={values.parentEmail}
            onChange={(e) => set("parentEmail", e.target.value)}
            onBlur={() => checkField("parentEmail")}
            aria-invalid={Boolean(fieldErrors.parentEmail)}
          />
        </FieldWrap>
      </Section>

      {showEnrolment && (
      <Section title={t.enquiries.convert.enrolmentSection}>
        {batches.length > 0 ? (
          <FieldWrap label={t.enquiries.convert.batch} error={fieldErrors.batchId}>
            <Select
              value={values.batchId || null}
              onValueChange={(value) => set("batchId", (value as string) ?? "")}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue>
                  {(value: string | null) =>
                    batches.find((batch) => batch.id === value)?.label ??
                    t.enquiries.convert.batchPlaceholder
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {batches.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldWrap>
        ) : (
          // A note, not a field — so it spans the grid rather than sitting in
          // the left column pretending to be one.
          <p className="rounded-lg border border-dashed border-border px-3 py-2.5 text-xs leading-relaxed text-muted-foreground sm:col-span-2 xl:col-span-3">
            {t.enquiries.convert.noBatches}
          </p>
        )}
        <FieldWrap
          label={t.enquiries.convert.registrationFee}
          error={fieldErrors.registrationFee}
        >
          <Input
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            placeholder="0"
            value={values.registrationFee}
            /*
              `min="0"` only binds native submission, and this form submits
              through JavaScript — so the minus key went straight in. Stripping
              anything that is not a digit or a decimal point is what actually
              keeps a fee from going below zero.
            */
            onChange={(e) => set("registrationFee", e.target.value.replace(/[^\d.]/g, ""))}
            onBlur={() => checkField("registrationFee")}
            aria-invalid={Boolean(fieldErrors.registrationFee)}
          />
        </FieldWrap>
      </Section>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Anchored to the bottom of the page rather than floating under the last
          card, so on a long form it is always the next thing after the fields
          instead of something you scroll past looking for. */}
      <div className="sticky bottom-0 -mx-1 flex items-center justify-end gap-2 border-t border-border bg-background/80 px-1 py-3 backdrop-blur">
        {cancelHref && (
          <Button
            variant="outline"
            size="lg"
            nativeButton={false}
            render={<Link href={cancelHref} />}
          >
            {t.common.cancel}
          </Button>
        )}
        <Button type="submit" size="lg" className="shadow-sm" disabled={saving}>
          <GraduationCapIcon aria-hidden="true" />
          {saving ? submittingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {hint && <p className="mt-1 max-w-prose text-xs leading-relaxed text-muted-foreground">{hint}</p>}
      </div>
      {/*
        Width goes into more columns rather than longer fields. A label sitting
        a screen-width away from its own input is unreadable, so the row count
        drops as the window grows instead of each box stretching.
      */}
      <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
        {children}
      </div>
    </section>
  );
}

function FieldWrap({
  label,
  error,
  required,
  prefilled,
  wide,
  children,
}: {
  label: string;
  error?: string;
  /*
    Only three fields on this form are required, so those are the ones that
    carry a tag. Marking the other nine "(optional)" instead put a grey
    parenthetical on almost every label and left the eye nothing to catch on.
  */
  required?: boolean;
  /*
    True only when the value genuinely arrived from the enquiry. Nothing on this
    form is retyped, but without the tag a filled box reads as a question being
    asked twice rather than an answer being carried forward.
  */
  prefilled?: boolean;
  /** Spans every column — for anything one line cannot hold. */
  wide?: boolean;
  children: React.ReactNode;
}) {
  const { t } = useLanguage();

  return (
    <div className={`space-y-1.5 ${wide ? "sm:col-span-2 xl:col-span-3" : ""}`}>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <Label>{label}</Label>
        {required && (
          <span className="text-[11px] font-medium text-[#f87483] dark:text-[#f8919c]">
            {t.common.required}
          </span>
        )}
        {prefilled && (
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
            {t.enquiries.convert.prefilled}
          </span>
        )}
      </div>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
