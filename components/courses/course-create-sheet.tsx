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
import { createCourse } from "@/lib/actions/courses";

const EMPTY = { name: "", description: "" };

/*
  Courses are entered in a burst when the academy is first set up — six of them
  in one sitting, then almost never again. "Save and add another" is what makes
  that sitting bearable, the same way it does on the enquiry sheet.
*/
export function CourseCreateSheet({
  label = "New Course",
  className,
}: {
  label?: string;
  className?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(EMPTY);
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
    setValues(EMPTY);
    setError(null);
    setFieldErrors({});
    setJustSaved(null);
  }

  async function save(addAnother: boolean) {
    setSaving(addAnother ? "another" : "save");
    setError(null);
    try {
      const result = await createCourse(values);
      if (!result.ok) {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      const savedName = values.name.trim();
      reset();

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
      setError("Could not save the course. Check your connection and try again.");
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
      <SheetTrigger render={<Button size="lg" className={className} />}>{label}</SheetTrigger>

      <SheetContent initialFocus={nameRef}>
        <SheetHeader>
          <SheetTitle>New course</SheetTitle>
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
              aria-invalid={Boolean(fieldErrors.description)}
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
              {saving === "another" ? "Saving…" : "Save and add another"}
            </Button>
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
