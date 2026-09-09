"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { createEnquiry, findByPhone, type PhoneMatch } from "@/lib/actions/enquiries";
import type { CourseOption } from "@/lib/courses-query";
import { useLanguage } from "@/lib/i18n/language-provider";
import { fill } from "@/lib/i18n/format";
import { translateFieldErrors, translateMessage } from "@/lib/i18n/messages";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { isCompletePhone, normalizePhone } from "@/lib/validations/enquiry";

const EMPTY = { phone: "", studentName: "", interestedIn: "", courseId: "", notes: "" };

function agoLabel(daysAgo: number, t: Dictionary) {
  if (daysAgo === 0) return t.enquiries.capture.today;
  if (daysAgo === 1) return t.enquiries.capture.yesterday;
  return fill(t.enquiries.capture.daysAgo, { count: daysAgo });
}

/*
  The most important screen in the product. If it takes longer than the paper
  register the receptionist stops using it, so: four fields, phone first and
  focused, Enter saves, and it never navigates away from the list.
*/
export function EnquiryCaptureSheet({
  label,
  className,
  courses = [],
}: {
  label?: string;
  className?: string;
  courses?: CourseOption[];
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [match, setMatch] = useState<{ phone: string; result: PhoneMatch | null } | null>(null);
  const [saving, setSaving] = useState<null | "save" | "another">(null);
  const [justSaved, setJustSaved] = useState<string | null>(null);

  const phoneRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof typeof EMPTY>(key: K, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: "" }));
    setJustSaved(null);
  }

  function reset() {
    setValues(EMPTY);
    setError(null);
    setFieldErrors({});
    setMatch(null);
    setJustSaved(null);
  }

  // Debounced duplicate lookup. The result is stored against the number it was
  // fetched for, so an edit hides a stale warning by derivation rather than by
  // clearing state from inside the effect. `latest` guards against an earlier,
  // slower response landing after a newer one.
  const latest = useRef(0);
  const phone = values.phone;
  const normalizedPhone = normalizePhone(phone);
  const complete = isCompletePhone(phone);

  useEffect(() => {
    if (!complete) return;
    const token = ++latest.current;
    const timer = setTimeout(() => {
      findByPhone(normalizedPhone)
        .then((result) => {
          if (latest.current === token) setMatch({ phone: normalizedPhone, result });
        })
        .catch(() => {
          // A failed lookup must never block capture — the warning is a bonus,
          // saving the enquiry is the job.
        });
    }, 400);
    return () => clearTimeout(timer);
  }, [complete, normalizedPhone]);

  const duplicate = complete && match?.phone === normalizedPhone ? match.result : null;

  /*
    Not wrapped in a transition on purpose. router.refresh() inside one keeps
    the transition pending until the server round-trip finishes, which left both
    buttons disabled with no spinner — indistinguishable from a dead button. The
    list behind the sheet can repaint in its own time; the next enquiry should
    never wait for it.
  */
  async function save(addAnother: boolean) {
    setSaving(addAnother ? "another" : "save");
    setError(null);
    try {
      const result = await createEnquiry(values);
      if (!result.ok) {
        setError(translateMessage(result.error, t));
        setFieldErrors(translateFieldErrors(result.fieldErrors, t));
        return;
      }

      const savedName = values.studentName.trim();
      reset();

      if (addAnother) {
        // The only signal that anything happened: the fields clear instantly,
        // so without this it reads as "nothing was saved".
        setJustSaved(savedName);
        phoneRef.current?.focus();
      } else {
        setOpen(false);
      }

      router.refresh();
    } catch {
      setError(t.errors.saveFailed);
    } finally {
      setSaving(null);
    }
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <SheetTrigger
        render={<Button size="lg" className={`shadow-sm ${className ?? ""}`} />}
      >
        <PlusIcon aria-hidden="true" />
        {label ?? t.enquiries.newEnquiry}
      </SheetTrigger>

      <SheetContent initialFocus={phoneRef}>
        <SheetHeader>
          <SheetTitle>{t.enquiries.capture.title}</SheetTitle>
          <SheetDescription>{t.enquiries.capture.description}</SheetDescription>
        </SheetHeader>

        {duplicate && (
          <div className="rounded-lg border border-[#e9974b]/40 bg-[#e9974b]/10 p-3 text-sm">
            <p className="text-foreground">
              {duplicate.kind === "enquiry"
                ? fill(
                    duplicate.status
                      ? t.enquiries.capture.duplicateEnquiryWithStatus
                      : t.enquiries.capture.duplicateEnquiry,
                    {
                      name: duplicate.name,
                      when: agoLabel(duplicate.daysAgo, t),
                      status: duplicate.status ? t.enquiries.status[duplicate.status] : "",
                    },
                  )
                : fill(t.enquiries.capture.duplicateParent, { name: duplicate.name })}
            </p>
            {duplicate.kind === "enquiry" && (
              <Link
                href={`/enquiries/${duplicate.id}`}
                onClick={() => setOpen(false)}
                className="mt-1 inline-block font-medium text-primary hover:underline"
              >
                {t.enquiries.capture.openExisting}
              </Link>
            )}
          </div>
        )}

        {justSaved && (
          <p
            role="status"
            className="rounded-lg border border-[#27af90]/40 bg-[#27af90]/10 p-3 text-sm text-foreground"
          >
            {fill(t.enquiries.capture.saved, { name: justSaved })}
          </p>
        )}

        <form
          className="flex flex-1 flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            save(false);
          }}
        >
          <Field label={t.enquiries.capture.phone} error={fieldErrors.phone}>
            <Input
              ref={phoneRef}
              name="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder={t.enquiries.capture.phonePlaceholder}
              value={values.phone}
              onChange={(event) => set("phone", event.target.value)}
              aria-invalid={Boolean(fieldErrors.phone)}
            />
          </Field>

          <Field label={t.enquiries.capture.studentName} error={fieldErrors.studentName}>
            <Input
              name="studentName"
              placeholder={t.enquiries.capture.studentNamePlaceholder}
              value={values.studentName}
              onChange={(event) => set("studentName", event.target.value)}
              aria-invalid={Boolean(fieldErrors.studentName)}
            />
          </Field>

          <Field label={t.enquiries.capture.interestedIn} error={fieldErrors.interestedIn} optional>
            <Input
              name="interestedIn"
              placeholder={t.enquiries.capture.interestedInPlaceholder}
              value={values.interestedIn}
              onChange={(event) => set("interestedIn", event.target.value)}
              aria-invalid={Boolean(fieldErrors.interestedIn)}
            />
          </Field>

          {/* The free-text field above stays the primary one: a parent often
              says "something for my 7-year-old" and forcing that into a course
              would lose it. This records a real course when they name one, so
              "how many enquiries for Keyboard this month" becomes answerable. */}
          {courses.length > 0 && (
            <Field label={t.enquiries.capture.course} error={fieldErrors.courseId} optional>
              <Select
                value={values.courseId || null}
                onValueChange={(value) => set("courseId", (value as string) ?? "")}
              >
                <SelectTrigger className="w-full">
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
            </Field>
          )}

          <Field label={t.enquiries.capture.note} error={fieldErrors.notes} optional>
            <Textarea
              name="notes"
              rows={3}
              placeholder={t.enquiries.capture.notePlaceholder}
              value={values.notes}
              onChange={(event) => set("notes", event.target.value)}
              aria-invalid={Boolean(fieldErrors.notes)}
            />
          </Field>

          {error && !Object.keys(fieldErrors).length && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="mt-auto flex flex-col-reverse gap-2 pt-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={saving !== null}
              onClick={() => save(true)}
              className="sm:flex-1"
            >
              {saving === "another" ? t.common.saving : t.enquiries.capture.saveAndAnother}
            </Button>
            <Button type="submit" size="lg" disabled={saving !== null} className="sm:flex-1">
              {saving === "save" ? t.common.saving : t.enquiries.capture.save}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function Field({
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
