"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircleIcon } from "lucide-react";
import { EXPERIENCE_OPTIONS } from "@/lib/enquiries";
import { updateEnquiryDetails } from "@/lib/actions/enquiries";
import { enquiryDetailsSchema } from "@/lib/validations/enquiry";
import { blurErrorFor, fieldErrorsOf } from "@/lib/validations/client";
import { useLanguage } from "@/lib/i18n/language-provider";
import { translateFieldErrors, translateMessage } from "@/lib/i18n/messages";
import type { CourseOption } from "@/lib/courses-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type EnquiryDetailValues = {
  studentName: string;
  phone: string;
  email: string;
  parentName: string;
  interestedIn: string;
  courseId: string;
  experience: string;
};

/*
  The half of an enquiry that is a fact about the person. Status, call-back date
  and notes stay on the enquiry page — they record what we did, not who they
  are, and a screen that mixes the two ends up doing neither well.
*/
export function EnquiryDetailsForm({
  enquiryId,
  initial,
  courses,
}: {
  enquiryId: string;
  initial: EnquiryDetailValues;
  courses: CourseOption[];
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const [values, setValues] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  function set(key: keyof EnquiryDetailValues, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: "" }));
  }

  function checkField(field: string) {
    setFieldErrors((current) => ({
      ...current,
      [field]: blurErrorFor(enquiryDetailsSchema, values, field, t),
    }));
  }

  async function submit() {
    const clientErrors = fieldErrorsOf(enquiryDetailsSchema, values, t);
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setError(null);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const result = await updateEnquiryDetails(enquiryId, values);
      if (!result.ok) {
        setError(translateMessage(result.error, t));
        setFieldErrors(translateFieldErrors(result.fieldErrors, t));
        return;
      }
      router.push(`/enquiries/${enquiryId}`);
      router.refresh();
    } catch {
      setError(t.errors.saveFailed);
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
      <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
          <Field
            label={t.enquiries.capture.studentName}
            error={fieldErrors.studentName}
            required
          >
            <Input
              value={values.studentName}
              onChange={(e) => set("studentName", e.target.value)}
              onBlur={() => checkField("studentName")}
              aria-invalid={Boolean(fieldErrors.studentName)}
            />
          </Field>

          <Field label={t.enquiries.detail.phone} error={fieldErrors.phone} required>
            <Input
              type="tel"
              inputMode="numeric"
              value={values.phone}
              onChange={(e) => set("phone", e.target.value)}
              onBlur={() => checkField("phone")}
              aria-invalid={Boolean(fieldErrors.phone)}
            />
          </Field>

          <Field label={t.enquiries.detail.email} error={fieldErrors.email}>
            <Input
              type="email"
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
              onBlur={() => checkField("email")}
              aria-invalid={Boolean(fieldErrors.email)}
            />
          </Field>

          <Field label={t.enquiries.detail.parent} error={fieldErrors.parentName}>
            <Input
              value={values.parentName}
              onChange={(e) => set("parentName", e.target.value)}
              onBlur={() => checkField("parentName")}
              aria-invalid={Boolean(fieldErrors.parentName)}
            />
          </Field>

          <Field label={t.enquiries.detail.interestedIn} error={fieldErrors.interestedIn}>
            <Input
              value={values.interestedIn}
              onChange={(e) => set("interestedIn", e.target.value)}
              onBlur={() => checkField("interestedIn")}
              aria-invalid={Boolean(fieldErrors.interestedIn)}
            />
          </Field>

          <Field label={t.enquiries.detail.course} error={fieldErrors.courseId}>
            {courses.length > 0 ? (
              <Select
                value={values.courseId || null}
                onValueChange={(value) => set("courseId", (value as string) ?? "")}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue>
                    {(value: string | null) =>
                      courses.find((course) => course.id === value)?.name ??
                      t.enquiries.capture.coursePlaceholder
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="rounded-lg border border-dashed border-border px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
                {t.enquiries.capture.noCourses}{" "}
                <Link href="/courses" className="font-medium text-primary hover:underline">
                  {t.nav.courses}
                </Link>
              </p>
            )}
          </Field>

          <Field label={t.enquiries.detail.experience} error={fieldErrors.experience}>
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
          </Field>
        </div>
      </section>

      {error && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="sticky bottom-0 -mx-1 flex items-center justify-end gap-2 border-t border-border bg-background/80 px-1 py-3 backdrop-blur">
        <Button
          variant="outline"
          size="lg"
          nativeButton={false}
          render={<Link href={`/enquiries/${enquiryId}`} />}
        >
          {t.common.cancel}
        </Button>
        <Button type="submit" size="lg" className="shadow-sm" disabled={saving}>
          {saving ? t.enquiries.editDetails.submitting : t.enquiries.editDetails.submit}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  const { t } = useLanguage();

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <Label>{label}</Label>
        {required && (
          <span className="text-[11px] font-medium text-[#f87483] dark:text-[#f8919c]">
            {t.common.required}
          </span>
        )}
      </div>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
