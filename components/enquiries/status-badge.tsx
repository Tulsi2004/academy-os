import type { EnquiryStatus } from "@/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { ENQUIRY_STATUS_BADGE_STYLES, ENQUIRY_STATUS_LABELS } from "@/lib/enquiries";

export function StatusBadge({ status }: { status: EnquiryStatus }) {
  return (
    <Badge className={ENQUIRY_STATUS_BADGE_STYLES[status]}>
      {ENQUIRY_STATUS_LABELS[status]}
    </Badge>
  );
}
