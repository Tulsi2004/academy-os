"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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
import { createEnquiry, findByPhone, type PhoneMatch } from "@/lib/actions/enquiries";
import { ENQUIRY_STATUS_LABELS } from "@/lib/enquiries";
import { isCompletePhone, normalizePhone } from "@/lib/validations/enquiry";

const EMPTY = { phone: "", studentName: "", interestedIn: "", notes: "" };

function agoLabel(daysAgo: number) {
  if (daysAgo === 0) return "today";
  if (daysAgo === 1) return "yesterday";
  return `${daysAgo} days ago`;
}

/*
  The most important screen in the product. If it takes longer than the paper
  register the receptionist stops using it, so: four fields, phone first and
  focused, Enter saves, and it never navigates away from the list.
*/
export function EnquiryCaptureSheet({
  label = "New Enquiry",
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
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
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
      setError("Could not save the enquiry. Check your connection and try again.");
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
      <SheetTrigger render={<Button size="lg" className={className} />}>
        {label}
      </SheetTrigger>

      <SheetContent initialFocus={phoneRef}>
        <SheetHeader>
          <SheetTitle>New enquiry</SheetTitle>
          <SheetDescription>
            Phone and name are enough. Everything else is collected at admission.
          </SheetDescription>
        </SheetHeader>

        {duplicate && (
          <div className="rounded-lg border border-[#e9974b]/40 bg-[#e9974b]/10 p-3 text-sm">
            <p className="text-foreground">
              <span className="font-semibold">{duplicate.name}</span>{" "}
              {duplicate.kind === "enquiry" ? (
                <>
                  enquired {agoLabel(duplicate.daysAgo)}
                  {duplicate.status ? ` — ${ENQUIRY_STATUS_LABELS[duplicate.status]}` : ""}
                </>
              ) : (
                <>is already on file as a parent</>
              )}
            </p>
            {duplicate.kind === "enquiry" && (
              <Link
                href={`/enquiries/${duplicate.id}`}
                onClick={() => setOpen(false)}
                className="mt-1 inline-block font-medium text-primary hover:underline"
              >
                Open existing
              </Link>
            )}
          </div>
        )}

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
          <Field label="Phone" error={fieldErrors.phone}>
            <Input
              ref={phoneRef}
              name="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="98765 43210"
              value={values.phone}
              onChange={(event) => set("phone", event.target.value)}
              aria-invalid={Boolean(fieldErrors.phone)}
            />
          </Field>

          <Field label="Student name" error={fieldErrors.studentName}>
            <Input
              name="studentName"
              placeholder="Kavya Sharma"
              value={values.studentName}
              onChange={(event) => set("studentName", event.target.value)}
              aria-invalid={Boolean(fieldErrors.studentName)}
            />
          </Field>

          <Field label="Interested in" error={fieldErrors.interestedIn} optional>
            <Input
              name="interestedIn"
              placeholder="Keyboard, weekend batch"
              value={values.interestedIn}
              onChange={(event) => set("interestedIn", event.target.value)}
              aria-invalid={Boolean(fieldErrors.interestedIn)}
            />
          </Field>

          <Field label="Note" error={fieldErrors.notes} optional>
            <Textarea
              name="notes"
              rows={3}
              placeholder="Walk-in, asked about fees"
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
