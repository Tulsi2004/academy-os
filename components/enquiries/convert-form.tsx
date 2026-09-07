"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { convertEnquiry } from "@/lib/actions/conversion";
import { EXPERIENCE_LABELS, EXPERIENCE_OPTIONS } from "@/lib/enquiries";
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
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }
      // Students isn't built yet, so the enquiry itself is where the outcome is
      // visible — it now reads as admitted, with the new student's name.
      router.push(`/enquiries/${enquiryId}`);
      router.refresh();
    } catch {
      setError("Could not complete the conversion. Nothing was saved — try again.");
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
      <Section title="Student">
        <Grid>
          <FieldWrap label="First name" error={fieldErrors.firstName}>
            <Input
              value={values.firstName}
              onChange={(e) => set("firstName", e.target.value)}
              aria-invalid={Boolean(fieldErrors.firstName)}
            />
          </FieldWrap>
          <FieldWrap label="Last name" error={fieldErrors.lastName} optional>
            <Input value={values.lastName} onChange={(e) => set("lastName", e.target.value)} />
          </FieldWrap>
          <FieldWrap label="Date of birth" error={fieldErrors.dateOfBirth} optional>
            <Input
              type="date"
              value={values.dateOfBirth}
              onChange={(e) => set("dateOfBirth", e.target.value)}
            />
          </FieldWrap>
          <FieldWrap label="Experience" error={fieldErrors.experience} optional>
            <Select
              value={values.experience || null}
              onValueChange={(value) => set("experience", (value as string) ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue>
                  {(value: string | null) =>
                    value ? EXPERIENCE_LABELS[value as keyof typeof EXPERIENCE_LABELS] : "Not set"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {EXPERIENCE_OPTIONS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {EXPERIENCE_LABELS[level]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldWrap>
          <FieldWrap label="Student phone" error={fieldErrors.studentPhone} optional>
            <Input
              type="tel"
              inputMode="numeric"
              value={values.studentPhone}
              onChange={(e) => set("studentPhone", e.target.value)}
              aria-invalid={Boolean(fieldErrors.studentPhone)}
            />
          </FieldWrap>
          <FieldWrap label="Student email" error={fieldErrors.studentEmail} optional>
            <Input
              type="email"
              value={values.studentEmail}
              onChange={(e) => set("studentEmail", e.target.value)}
              aria-invalid={Boolean(fieldErrors.studentEmail)}
            />
          </FieldWrap>
        </Grid>
        <FieldWrap label="Address" error={fieldErrors.address} optional>
          <Textarea
            rows={2}
            value={values.address}
            onChange={(e) => set("address", e.target.value)}
          />
        </FieldWrap>
      </Section>

      <Section
        title="Parent / guardian"
        hint="Matched on phone — an existing parent with this number is reused, not duplicated."
      >
        <Grid>
          <FieldWrap label="Name" error={fieldErrors.parentName}>
            <Input
              value={values.parentName}
              onChange={(e) => set("parentName", e.target.value)}
              aria-invalid={Boolean(fieldErrors.parentName)}
            />
          </FieldWrap>
          <FieldWrap label="Phone" error={fieldErrors.parentPhone}>
            <Input
              type="tel"
              inputMode="numeric"
              value={values.parentPhone}
              onChange={(e) => set("parentPhone", e.target.value)}
              aria-invalid={Boolean(fieldErrors.parentPhone)}
            />
          </FieldWrap>
          <FieldWrap label="Email" error={fieldErrors.parentEmail} optional>
            <Input
              type="email"
              value={values.parentEmail}
              onChange={(e) => set("parentEmail", e.target.value)}
              aria-invalid={Boolean(fieldErrors.parentEmail)}
            />
          </FieldWrap>
        </Grid>
      </Section>

      <Section title="Enrolment">
        <Grid>
          {batches.length > 0 ? (
            <FieldWrap label="Batch" error={fieldErrors.batchId} optional>
              <Select
                value={values.batchId || null}
                onValueChange={(value) => set("batchId", (value as string) ?? "")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: string | null) =>
                      batches.find((batch) => batch.id === value)?.label ?? "No batch yet"
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
            <p className="text-sm text-muted-foreground">
              No batches exist yet, so the student is admitted without one. They can be
              enrolled once Batches is built.
            </p>
          )}

          <FieldWrap label="Registration fee (INR)" error={fieldErrors.registrationFee} optional>
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
        {saving ? "Converting…" : "Convert to student"}
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
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {optional && <span className="ml-1 text-muted-foreground">(optional)</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
