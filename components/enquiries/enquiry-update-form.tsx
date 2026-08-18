"use client";

import { useActionState } from "react";
import type { Enquiry } from "@/generated/prisma/client";
import { updateEnquiry, type EnquiryActionState } from "@/lib/actions/enquiries";
import { ENQUIRY_STATUS_LABELS, ENQUIRY_STATUS_OPTIONS } from "@/lib/enquiries";

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
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
            {state.error}
          </div>
        )}
        {state.success && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
            Enquiry updated.
          </div>
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
            <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={enquiry.status}
              className="form-input"
            >
              {ENQUIRY_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {ENQUIRY_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="followUpDate"
              className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Follow-up date
            </label>
            <input
              id="followUpDate"
              name="followUpDate"
              type="date"
              defaultValue={toDateInputValue(enquiry.followUpDate)}
              className="form-input"
            />
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={5}
            defaultValue={enquiry.notes ?? ""}
            className="form-input"
            placeholder="Add context for the team — what was discussed, next steps, etc."
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
