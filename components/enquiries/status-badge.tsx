"use client";

import type { EnquiryStatus } from "@/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { ENQUIRY_STATUS_BADGE_STYLES } from "@/lib/enquiries";
import { useLanguage } from "@/lib/i18n/language-provider";

export function StatusBadge({ status }: { status: EnquiryStatus }) {
  const { t } = useLanguage();

  return (
    // The hint is the badge's tooltip: the six statuses are the one piece of
    // vocabulary this screen asks people to learn, so the explanation travels
    // with the word instead of living in a legend nobody opens.
    <Badge className={ENQUIRY_STATUS_BADGE_STYLES[status]} title={t.enquiries.statusHint[status]}>
      {t.enquiries.status[status]}
    </Badge>
  );
}
