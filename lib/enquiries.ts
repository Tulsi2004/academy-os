import { EnquiryStatus, ExperienceLevel } from "@/generated/prisma/enums";

export const ENQUIRY_STATUS_LABELS: Record<EnquiryStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  INTERESTED: "Interested",
  FOLLOW_UP: "Follow-up",
  ADMITTED: "Converted",
  LOST: "Lost",
};

export const ENQUIRY_STATUS_BADGE_STYLES: Record<EnquiryStatus, string> = {
  NEW: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  CONTACTED: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
  INTERESTED: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  FOLLOW_UP: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300",
  ADMITTED: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  LOST: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
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
  none: "text-zinc-400 dark:text-zinc-500",
  overdue: "text-rose-600 dark:text-rose-400 font-medium",
  today: "text-indigo-600 dark:text-indigo-400 font-medium",
  tomorrow: "text-zinc-700 dark:text-zinc-300",
  upcoming: "text-zinc-500 dark:text-zinc-400",
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
