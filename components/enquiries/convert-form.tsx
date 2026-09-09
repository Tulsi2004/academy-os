"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { convertEnquiry } from "@/lib/actions/conversion";
import { EXPERIENCE_OPTIONS } from "@/lib/enquiries";
import { useLanguage } from "@/lib/i18n/language-provider";
import { translateFieldErrors, translateMessage } from "@/lib/i18n/messages";
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

export function ConvertForm({
  enquiryId,
  defaults,
  batches,
}: {
  enquiryId: string;
  defaults: {
    firstName: string;
    lastName: string;
    parentName: string;
    parentPhone: string;
    experience: string;
  };
  batches: BatchOption[];
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const [values, setValues] = useState({
    firstName: defaults.firstName,
    lastName: defaults.lastName,
    dateOfBirth: "",
    experience: defaults.experience,
    address: "",
    studentPhone: "",
    studentEmail: "",
    parentName: defaults.parentName,
    parentPhone: defaults.parentPhone,
    parentEmail: "",
    batchId: "",
    registrationFee: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function set(key: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: "" }));
  }

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      const result = await convertEnquiry(enquiryId, values);
      if (!result.ok) {
        setError(translateMessage(result.error, t));
        setFieldErrors(translateFieldErrors(result.fieldErrors, t));
        return;
      }
      // Land on the record that was just created, not back on the enquiry —
      // the next thing anyone does is check the student's details.
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
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <Section title={t.enquiries.convert.studentSection}>
        <Grid>
          <FieldWrap label={t.enquiries.convert.firstName} error={fieldErrors.firstName}>
            <Input
              value={values.firstName}
              onChange={(e) => set("firstName", e.target.value)}
              aria-invalid={Boolean(fieldErrors.firstName)}
            />
          </FieldWrap>
          <FieldWrap label={t.enquiries.convert.lastName} error={fieldErrors.lastName} optional>
            <Input value={values.lastName} onChange={(e) => set("lastName", e.target.value)} />
          </FieldWrap>
          <FieldWrap label={t.enquiries.convert.dateOfBirth} error={fieldErrors.dateOfBirth} optional>
            <Input
              type="date"
              value={values.dateOfBirth}
              onChange={(e) => set("dateOfBirth", e.target.value)}
            />
          </FieldWrap>
          <FieldWrap label={t.enquiries.convert.experience} error={fieldErrors.experience} optional>
            <Select
              value={values.experience || null}
              onValueChange={(value) => set("experience", (value as string) ?? "")}
            >
              <SelectTrigger className="w-full">
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
          <FieldWrap label={t.enquiries.convert.studentPhone} error={fieldErrors.studentPhone} optional>
            <Input
              type="tel"
              inputMode="numeric"
              value={values.studentPhone}
              onChange={(e) => set("studentPhone", e.target.value)}
              aria-invalid={Boolean(fieldErrors.studentPhone)}
            />
          </FieldWrap>
          <FieldWrap label={t.enquiries.convert.studentEmail} error={fieldErrors.studentEmail} optional>
            <Input
              type="email"
              value={values.studentEmail}
              onChange={(e) => set("studentEmail", e.target.value)}
              aria-invalid={Boolean(fieldErrors.studentEmail)}
            />
          </FieldWrap>
        </Grid>
        <FieldWrap label={t.enquiries.convert.address} error={fieldErrors.address} optional>
          <Textarea
            rows={2}
            value={values.address}
            onChange={(e) => set("address", e.target.value)}
          />
        </FieldWrap>
      </Section>

      <Section
        title={t.enquiries.convert.parentSection}
        hint={t.enquiries.convert.parentHint}
      >
        <Grid>
          <FieldWrap label={t.enquiries.convert.parentName} error={fieldErrors.parentName}>
            <Input
              value={values.parentName}
              onChange={(e) => set("parentName", e.target.value)}
              aria-invalid={Boolean(fieldErrors.parentName)}
            />
          </FieldWrap>
          <FieldWrap label={t.enquiries.convert.parentPhone} error={fieldErrors.parentPhone}>
            <Input
              type="tel"
              inputMode="numeric"
              value={values.parentPhone}
              onChange={(e) => set("parentPhone", e.target.value)}
              aria-invalid={Boolean(fieldErrors.parentPhone)}
            />
          </FieldWrap>
          <FieldWrap label={t.enquiries.convert.parentEmail} error={fieldErrors.parentEmail} optional>
            <Input
              type="email"
              value={values.parentEmail}
              onChange={(e) => set("parentEmail", e.target.value)}
              aria-invalid={Boolean(fieldErrors.parentEmail)}
            />
          </FieldWrap>
        </Grid>
      </Section>

      <Section title={t.enquiries.convert.enrolmentSection}>
        <Grid>
          {batches.length > 0 ? (
            <FieldWrap label={t.enquiries.convert.batch} error={fieldErrors.batchId} optional>
              <Select
                value={values.batchId || null}
                onValueChange={(value) => set("batchId", (value as string) ?? "")}
              >
                <SelectTrigger className="w-full">
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
            <p className="text-sm text-muted-foreground">{t.enquiries.convert.noBatches}</p>
          )}

          <FieldWrap label={t.enquiries.convert.registrationFee} error={fieldErrors.registrationFee} optional>
            <Input
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              placeholder="0"
              value={values.registrationFee}
              onChange={(e) => set("registrationFee", e.target.value)}
              aria-invalid={Boolean(fieldErrors.registrationFee)}
            />
          </FieldWrap>
        </Grid>
      </Section>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" size="lg" disabled={saving}>
        {saving ? t.enquiries.convert.submitting : t.enquiries.convert.submit}
      </Button>
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
    <section className="space-y-4 rounded-xl border border-border bg-card p-5">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>;
}

function FieldWrap({
  label,
  error,
  optional,
  children,
}: {
  label: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  const { t } = useLanguage();

  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {optional && <span className="ml-1 text-muted-foreground">({t.common.optional})</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
