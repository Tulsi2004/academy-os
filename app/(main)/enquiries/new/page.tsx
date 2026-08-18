import Link from "next/link";
import { EnquiryForm } from "@/components/enquiries/enquiry-form";

export default function NewEnquiryPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/enquiries"
          className="text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          ← Back to enquiries
        </Link>
        <h2 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          New Enquiry
        </h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Capture the details of a prospective student.
        </p>
      </div>

      <EnquiryForm />
    </div>
  );
}
