import { EnquiryStatus, ExperienceLevel } from "@/generated/prisma/enums";

export const ENQUIRY_STATUS_LABELS: Record<EnquiryStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  INTERESTED: "Interested",
  FOLLOW_UP: "Follow-up",
  ADMITTED: "Converted",
  LOST: "Lost",
};

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

export const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  NONE: "No experience",
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

export const EXPERIENCE_OPTIONS = Object.values(ExperienceLevel);

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export type FollowUpTone = "none" | "overdue" | "today" | "tomorrow" | "upcoming";

export function formatFollowUp(followUpDate: Date | null): {
  label: string;
  tone: FollowUpTone;
} {
  if (!followUpDate) return { label: "—", tone: "none" };

  const today = startOfDay(new Date());
  const target = startOfDay(followUpDate);
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86_400_000);

  if (diffDays < 0) return { label: "Overdue", tone: "overdue" };
  if (diffDays === 0) return { label: "Today", tone: "today" };
  if (diffDays === 1) return { label: "Tomorrow", tone: "tomorrow" };

  return {
    label: followUpDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      ...(target.getFullYear() !== today.getFullYear() ? { year: "numeric" } : {}),
    }),
    tone: "upcoming",
  };
}

export const FOLLOW_UP_TONE_STYLES: Record<FollowUpTone, string> = {
  none: "text-muted-foreground",
  overdue: "text-[#f87483] dark:text-[#f8919c] font-medium",
  today: "text-primary font-medium",
  tomorrow: "text-foreground",
  upcoming: "text-muted-foreground",
};

export function formatDateTime(date: Date) {
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
