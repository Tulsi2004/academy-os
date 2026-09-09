"use client";

import { useActionState, useState } from "react";
import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react";
import type { Enquiry } from "@/generated/prisma/client";
import { updateEnquiry, type EnquiryActionState } from "@/lib/actions/enquiries";
import { ENQUIRY_STATUS_OPTIONS } from "@/lib/enquiries";
import { updateEnquirySchema } from "@/lib/validations/enquiry";
import { fieldErrorsOf } from "@/lib/validations/client";
import { useLanguage } from "@/lib/i18n/language-provider";
import { translateMessage } from "@/lib/i18n/messages";
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

function toDateInputValue(date: Date | null) {
  if (!date) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 10);
}

export function EnquiryUpdateForm({ enquiry }: { enquiry: Enquiry }) {
  const { t } = useLanguage();
  // Status is fixed once the enquiry has become a student — see updateEnquiry.
  const converted = Boolean(enquiry.convertedStudentId);

  const updateWithId = updateEnquiry.bind(null, enquiry.id);
  const [state, formAction, pending] = useActionState(updateWithId, initialState);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        const data = new FormData(event.currentTarget);
        const errors = fieldErrorsOf(
          updateEnquirySchema,
          {
            status: data.get("status"),
            followUpDate: (data.get("followUpDate") as string) || undefined,
            note: (data.get("note") as string) || undefined,
          },
          t,
        );
        setFieldErrors(errors);
        // Stops the action: a date the server is going to reject should not
        // cost a round trip, and the message belongs under the field that
        // caused it rather than in the banner at the top.
        if (Object.keys(errors).length > 0) event.preventDefault();
      }}
      className="space-y-5"
    >
      {/* Always rendered (even when empty) so the fields below never shift position in the
          tree — that shift was causing the browser to lose the just-submitted form values. */}
      <div>
        {state.error && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertDescription>{translateMessage(state.error, t)}</AlertDescription>
          </Alert>
        )}
        {state.success && (
          <Alert className="border-[#27af90]/30 bg-[#27af90]/10 text-[#27af90] dark:text-[#4dc9a8] [&_svg]:text-current">
            <CheckCircle2Icon />
            <AlertDescription className="text-current">{t.enquiries.detail.updated}</AlertDescription>
          </Alert>
        )}
      </div>

      {/*
        Keyed on updatedAt: React resets uncontrolled fields to their original mount-time
        defaultValue after a successful form action, not to any new prop value. Keying this
        subtree forces a remount once the save lands and `enquiry` is re-fetched, so the
        fields pick up the just-saved values instead of snapping back to what they were
        when the page first loaded. The banner above lives outside this subtree so it
        doesn't get reset along with it.
      */}
      <div key={enquiry.updatedAt.getTime()} className="space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="status" className="mb-1.5">
              {t.enquiries.detail.status}
            </Label>
            <Select name="status" defaultValue={enquiry.status} disabled={converted}>
              <SelectTrigger id="status" className="w-full">
                <SelectValue>
                  {(value: string | null) =>
                    value ? t.enquiries.status[value as keyof typeof t.enquiries.status] : ""
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ENQUIRY_STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {t.enquiries.status[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {converted && (
              <p className="mt-1.5 text-xs text-muted-foreground">
                {t.enquiries.detail.statusFixed}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="followUpDate" className="mb-1.5">
              {t.enquiries.detail.followUpDate}
            </Label>
            <Input
              id="followUpDate"
              name="followUpDate"
              type="date"
              defaultValue={toDateInputValue(enquiry.followUpDate)}
              aria-invalid={Boolean(fieldErrors.followUpDate)}
            />
            {fieldErrors.followUpDate ? (
              <p className="mt-1.5 text-xs text-destructive">{fieldErrors.followUpDate}</p>
            ) : (
              <p className="mt-1.5 text-xs text-muted-foreground">
                {t.enquiries.detail.followUpHint}
              </p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="note" className="mb-1.5">
            {t.enquiries.detail.note}
          </Label>
          <Textarea
            id="note"
            name="note"
            rows={4}
            placeholder={t.enquiries.detail.notePlaceholder}
            aria-invalid={Boolean(fieldErrors.note)}
          />
          {fieldErrors.note ? (
            <p className="mt-1.5 text-xs text-destructive">{fieldErrors.note}</p>
          ) : (
            <p className="mt-1.5 text-xs text-muted-foreground">{t.enquiries.detail.noteHint}</p>
          )}
        </div>
      </div>

      <Button type="submit" size="lg" className="shadow-sm" disabled={pending}>
        {pending ? t.common.saving : t.enquiries.detail.saveChanges}
      </Button>
    </form>
  );
}
