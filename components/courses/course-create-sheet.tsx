"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { createCourse, updateCourse } from "@/lib/actions/courses";
import { createCourseSchema } from "@/lib/validations/course";
import { blurErrorFor, fieldErrorsOf } from "@/lib/validations/client";
import { useLanguage } from "@/lib/i18n/language-provider";
import { translateFieldErrors, translateMessage } from "@/lib/i18n/messages";

const EMPTY = { name: "", description: "" };

/*
  Courses are entered in a burst when the academy is first set up — six of them
  in one sitting, then almost never again. "Save and add another" is what makes
  that sitting bearable, the same way it does on the enquiry sheet.
*/
/*
  Creating and editing a course are the same two fields, so they are the same
  sheet. `course` decides which: absent means new, present means edit — and edit
  drops "Save and add another", which would otherwise read as a way to make a
  copy of the course you are editing.
*/
export function CourseCreateSheet({
  label = "New Course",
  className,
  course,
  variant,
}: {
  label?: string;
  className?: string;
  course?: { id: string; name: string; description: string | null };
  variant?: "default" | "outline";
}) {
  const editing = Boolean(course);
  const router = useRouter();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(
    course ? { name: course.name, description: course.description ?? "" } : EMPTY,
  );
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<null | "save" | "another">(null);
  const [justSaved, setJustSaved] = useState<string | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof typeof EMPTY>(key: K, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: "" }));
    setJustSaved(null);
  }

  function reset() {
    if (course) return;
    setValues(EMPTY);
    setError(null);
    setFieldErrors({});
    setJustSaved(null);
  }

  function checkField(field: string) {
    setFieldErrors((current) => ({
      ...current,
      [field]: blurErrorFor(createCourseSchema, values, field, t),
    }));
  }

  async function save(addAnother: boolean) {
    const clientErrors = fieldErrorsOf(createCourseSchema, values, t);
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setError(null);
      return;
    }

    setSaving(addAnother ? "another" : "save");
    setError(null);
    try {
      const result = course
        ? await updateCourse(course.id, values)
        : await createCourse(values);
      if (!result.ok) {
        setError(translateMessage(result.error, t));
        setFieldErrors(translateFieldErrors(result.fieldErrors, t));
        return;
      }

      const savedName = values.name.trim();
      reset();
      // An edit finishes; only creation loops round for the next one.
      if (course) {
        setOpen(false);
        router.refresh();
        return;
      }

      if (addAnother) {
        // The only signal that anything happened: the fields clear instantly,
        // so without this it reads as "nothing was saved".
        setJustSaved(savedName);
        nameRef.current?.focus();
      } else {
        setOpen(false);
      }

      router.refresh();
    } catch {
      setError(t.errors.courseSaveFailed);
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
      <SheetTrigger render={<Button size="lg" variant={variant} className={className} />}>
        {label}
      </SheetTrigger>

      <SheetContent initialFocus={nameRef}>
        <SheetHeader>
          <SheetTitle>{editing ? label : "New course"}</SheetTitle>
          <SheetDescription>
            The subject you teach. Timings, teacher and room belong to a batch, not here.
          </SheetDescription>
        </SheetHeader>

        {justSaved && (
          <p
            role="status"
            className="rounded-lg border border-[#27af90]/40 bg-[#27af90]/10 p-3 text-sm text-foreground"
          >
            Saved <span className="font-semibold">{justSaved}</span>. Add the next one.
          </p>
        )}

        <form
          className="flex flex-1 flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            save(false);
          }}
        >
          <Field label="Course name" error={fieldErrors.name}>
            <Input
              ref={nameRef}
              name="name"
              placeholder="Bharatanatyam"
              value={values.name}
              onChange={(event) => set("name", event.target.value)}
              onBlur={() => checkField("name")}
              aria-invalid={Boolean(fieldErrors.name)}
            />
          </Field>

          <Field label="Description" error={fieldErrors.description} optional>
            <Textarea
              name="description"
              rows={3}
              placeholder="Classical dance, ages 6 and up"
              value={values.description}
              onChange={(event) => set("description", event.target.value)}
              onBlur={() => checkField("description")}
              aria-invalid={Boolean(fieldErrors.description)}
            />
          </Field>

          {error && !Object.keys(fieldErrors).length && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="mt-auto flex flex-col-reverse gap-2 pt-2 sm:flex-row">
            {!editing && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={saving !== null}
              onClick={() => save(true)}
              className="sm:flex-1"
            >
              {saving === "another" ? "Saving…" : "Save and add another"}
            </Button>
            )}
            <Button type="submit" size="lg" disabled={saving !== null} className="sm:flex-1">
              {saving === "save" ? "Saving…" : "Save"}
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
