import Link from "next/link";
import { EnquiryForm } from "@/components/enquiries/enquiry-form";

export default function NewEnquiryPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/enquiries"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          ← Back to enquiries
        </Link>
        <h2 className="mt-2 text-2xl font-semibold text-foreground">New Enquiry</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Capture the details of a prospective student.
        </p>
      </div>

      <EnquiryForm />
    </div>
  );
}
