"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AlertCircleIcon } from "lucide-react";
import { createEnquiry, type EnquiryActionState } from "@/lib/actions/enquiries";
import { EXPERIENCE_LABELS, EXPERIENCE_OPTIONS } from "@/lib/enquiries";
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
import { Textarea } from "@/components/ui/textarea";

const initialState: EnquiryActionState = {};

export function EnquiryForm() {
  const [state, formAction, pending] = useActionState(createEnquiry, initialState);

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      {state.error && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Student name" htmlFor="studentName" required>
          <Input id="studentName" name="studentName" required placeholder="Asha Kumar" />
        </Field>

        <Field label="Parent / guardian name" htmlFor="parentName">
          <Input id="parentName" name="parentName" placeholder="Optional" />
        </Field>

        <Field label="Phone" htmlFor="phone" required>
          <Input id="phone" name="phone" required type="tel" placeholder="98xxxxxxxx" />
        </Field>

        <Field label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" placeholder="Optional" />
        </Field>

        <Field label="Interested in" htmlFor="interestedIn">
          <Input id="interestedIn" name="interestedIn" placeholder="e.g. Bharatanatyam" />
        </Field>

        <Field label="Experience" htmlFor="experience">
          <Select name="experience">
            <SelectTrigger id="experience" className="w-full">
              <SelectValue placeholder="Not specified">
                {(value: string | null) =>
                  value ? EXPERIENCE_LABELS[value as keyof typeof EXPERIENCE_LABELS] : "Not specified"
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
        </Field>

        <Field label="Follow-up date" htmlFor="followUpDate">
          <Input id="followUpDate" name="followUpDate" type="date" />
        </Field>
      </div>

      <Field label="Notes" htmlFor="notes">
        <Textarea
          id="notes"
          name="notes"
          rows={4}
          placeholder="Anything the team should know about this enquiry"
        />
      </Field>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending} size="lg">
          {pending ? "Saving…" : "Create Enquiry"}
        </Button>
        <Button variant="ghost" size="lg" nativeButton={false} render={<Link href="/enquiries" />}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={htmlFor} className="mb-1.5">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
    </div>
  );
}
