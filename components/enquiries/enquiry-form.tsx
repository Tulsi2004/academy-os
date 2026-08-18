"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createEnquiry, type EnquiryActionState } from "@/lib/actions/enquiries";
import { EXPERIENCE_LABELS, EXPERIENCE_OPTIONS } from "@/lib/enquiries";

const initialState: EnquiryActionState = {};

export function EnquiryForm() {
  const [state, formAction, pending] = useActionState(createEnquiry, initialState);

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      {state.error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Student name" htmlFor="studentName" required>
          <input
            id="studentName"
            name="studentName"
            required
            className="form-input"
            placeholder="Asha Kumar"
          />
        </Field>

        <Field label="Parent / guardian name" htmlFor="parentName">
          <input id="parentName" name="parentName" className="form-input" placeholder="Optional" />
        </Field>

        <Field label="Phone" htmlFor="phone" required>
          <input
            id="phone"
            name="phone"
            required
            type="tel"
            className="form-input"
            placeholder="98xxxxxxxx"
          />
        </Field>

        <Field label="Email" htmlFor="email">
          <input
            id="email"
            name="email"
            type="email"
            className="form-input"
            placeholder="Optional"
          />
        </Field>

        <Field label="Interested in" htmlFor="interestedIn">
          <input
            id="interestedIn"
            name="interestedIn"
            className="form-input"
            placeholder="e.g. Bharatanatyam"
          />
        </Field>

        <Field label="Experience" htmlFor="experience">
          <select id="experience" name="experience" defaultValue="" className="form-input">
            <option value="">Not specified</option>
            {EXPERIENCE_OPTIONS.map((level) => (
              <option key={level} value={level}>
                {EXPERIENCE_LABELS[level]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Follow-up date" htmlFor="followUpDate">
          <input id="followUpDate" name="followUpDate" type="date" className="form-input" />
        </Field>
      </div>

      <Field label="Notes" htmlFor="notes">
        <textarea
          id="notes"
          name="notes"
          rows={4}
          className="form-input"
          placeholder="Anything the team should know about this enquiry"
        />
      </Field>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving…" : "Create Enquiry"}
        </button>
        <Link
          href="/enquiries"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Cancel
        </Link>
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
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </label>
      {children}
    </div>
  );
}
