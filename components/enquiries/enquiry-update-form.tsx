"use client";

import { useActionState } from "react";
import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react";
import type { Enquiry } from "@/generated/prisma/client";
import { updateEnquiry, type EnquiryActionState } from "@/lib/actions/enquiries";
import { ENQUIRY_STATUS_LABELS, ENQUIRY_STATUS_OPTIONS } from "@/lib/enquiries";
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
  const updateWithId = updateEnquiry.bind(null, enquiry.id);
  const [state, formAction, pending] = useActionState(updateWithId, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {/* Always rendered (even when empty) so the fields below never shift position in the
          tree — that shift was causing the browser to lose the just-submitted form values. */}
      <div>
        {state.error && (
          <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}
        {state.success && (
          <Alert className="border-[#27af90]/30 bg-[#27af90]/10 text-[#27af90] dark:text-[#4dc9a8] [&_svg]:text-current">
            <CheckCircle2Icon />
            <AlertDescription className="text-current">Enquiry updated.</AlertDescription>
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
              Status
            </Label>
            <Select name="status" defaultValue={enquiry.status}>
              <SelectTrigger id="status" className="w-full">
                <SelectValue>
                  {(value: string | null) =>
                    value ? ENQUIRY_STATUS_LABELS[value as keyof typeof ENQUIRY_STATUS_LABELS] : ""
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {ENQUIRY_STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {ENQUIRY_STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="followUpDate" className="mb-1.5">
              Follow-up date
            </Label>
            <Input
              id="followUpDate"
              name="followUpDate"
              type="date"
              defaultValue={toDateInputValue(enquiry.followUpDate)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="notes" className="mb-1.5">
            Notes
          </Label>
          <Textarea
            id="notes"
            name="notes"
            rows={5}
            defaultValue={enquiry.notes ?? ""}
            placeholder="Add context for the team — what was discussed, next steps, etc."
          />
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
