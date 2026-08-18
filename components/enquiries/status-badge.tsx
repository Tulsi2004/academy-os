import type { EnquiryStatus } from "@/generated/prisma/client";
import { ENQUIRY_STATUS_BADGE_STYLES, ENQUIRY_STATUS_LABELS } from "@/lib/enquiries";

export function StatusBadge({ status }: { status: EnquiryStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${ENQUIRY_STATUS_BADGE_STYLES[status]}`}
    >
      {ENQUIRY_STATUS_LABELS[status]}
    </span>
  );
}
