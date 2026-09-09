import { EnquiryStatus, ExperienceLevel } from "@/generated/prisma/enums";
import { ACADEMY_TIME_ZONE, academyDaysFromToday, startOfAcademyDay } from "@/lib/day";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { fill } from "@/lib/i18n/format";
import { normalizePhone } from "@/lib/validations/enquiry";

/*
  Colors reuse academy-os-landing's "pop" accent palette (pop-blue, pop-orange,
  pop-purple/primary, pop-green, pop-coral) so status colors read as the same
  brand across the marketing site and the dashboard, not generic Tailwind hues.
*/
export const ENQUIRY_STATUS_BADGE_STYLES: Record<EnquiryStatus, string> = {
  NEW: "bg-muted text-muted-foreground",
  CONTACTED: "bg-[#3056d1]/10 text-[#3056d1] dark:bg-[#6d8bef]/15 dark:text-[#6d8bef]",
  INTERESTED: "bg-[#e9974b]/15 text-[#e9974b] dark:bg-[#eba86a]/15 dark:text-[#eba86a]",
  FOLLOW_UP: "bg-primary/10 text-primary",
  ADMITTED: "bg-[#27af90]/15 text-[#27af90] dark:bg-[#4dc9a8]/15 dark:text-[#4dc9a8]",
  LOST: "bg-[#f87483]/15 text-[#f87483] dark:bg-[#f8919c]/15 dark:text-[#f8919c]",
};

export const ENQUIRY_STATUS_OPTIONS = Object.values(EnquiryStatus);

export const EXPERIENCE_OPTIONS = Object.values(ExperienceLevel);

export type FollowUpTone = "none" | "overdue" | "today" | "tomorrow" | "upcoming";

/*
  Tone and wording are separated on purpose. The tone is a fact about the date
  that the server can compute and group by; the wording depends on who is
  reading and comes out of their dictionary.
*/
export function followUpTone(followUpDate: Date | null): FollowUpTone {
  if (!followUpDate) return "none";

  const diffDays = academyDaysFromToday(followUpDate);
  if (diffDays < 0) return "overdue";
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "tomorrow";
  return "upcoming";
}

export function followUpLabel(
  followUpDate: Date | null,
  t: Dictionary,
  intl: string,
): { label: string; tone: FollowUpTone; title?: string } {
  const tone = followUpTone(followUpDate);
  if (!followUpDate) return { label: t.enquiries.followUp.none, tone };

  const exact = formatDate(followUpDate, intl);
  switch (tone) {
    case "overdue":
      // "Overdue" alone leaves the reader wondering by how much, and the answer
      // changes what they say when the parent picks up.
      return {
        label: t.enquiries.followUp.overdue,
        tone,
        title: fill(t.enquiries.followUp.overdueOn, { date: exact }),
      };
    case "today":
      return { label: t.enquiries.followUp.today, tone, title: exact };
    case "tomorrow":
      return { label: t.enquiries.followUp.tomorrow, tone, title: exact };
    default:
      return { label: fill(t.enquiries.followUp.on, { date: exact }), tone };
  }
}

export const FOLLOW_UP_TONE_STYLES: Record<FollowUpTone, string> = {
  none: "text-muted-foreground",
  overdue: "text-[#f87483] dark:text-[#f8919c] font-medium",
  today: "text-primary font-medium",
  tomorrow: "text-foreground",
  upcoming: "text-muted-foreground",
};

export function formatDateTime(date: Date, intl: string) {
  return date.toLocaleString(intl, {
    timeZone: ACADEMY_TIME_ZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDate(date: Date, intl: string) {
  const sameYear =
    startOfAcademyDay(date).getUTCFullYear() === startOfAcademyDay().getUTCFullYear();
  return date.toLocaleDateString(intl, {
    timeZone: ACADEMY_TIME_ZONE,
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

/*
  Phone numbers are stored as bare national digits (see normalizePhone), which
  a dialler handles fine but WhatsApp does not — wa.me needs the country code.
  Every number in the product is an Indian mobile today; when that stops being
  true this is the one place that has to learn about country codes.
*/
const DEFAULT_COUNTRY_CODE = "91";

export function telHref(phone: string) {
  return `tel:${normalizePhone(phone)}`;
}

export function whatsAppHref(phone: string) {
  return `https://wa.me/${DEFAULT_COUNTRY_CODE}${normalizePhone(phone)}`;
}

/*
  Search, status filter and page all live in the URL so the view survives a
  refresh, a back button and a shared link. Every control rebuilds the whole
  query string through here rather than mutating one key, which is what keeps
  "filter by status" from silently dropping an active search.
*/
export function enquiriesHref({
  q,
  status,
  page,
}: {
  q?: string;
  status?: string;
  page?: number;
}) {
  const params = new URLSearchParams();
  if (q?.trim()) params.set("q", q.trim());
  if (status) params.set("status", status);
  if (page && page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/enquiries?${query}` : "/enquiries";
}
