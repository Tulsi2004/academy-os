"use client";

import Link from "next/link";
import { AlarmClockIcon, CheckCircle2Icon, PhoneCallIcon, UserPlusIcon } from "lucide-react";
import { enquiriesHref } from "@/lib/enquiries";
import { useLanguage } from "@/lib/i18n/language-provider";

/*
  The first thing on the page, because "what do I have to do today?" is the
  question the enquiry list exists to answer — and reading it off a table of
  twenty-five rows means interpreting a date column one row at a time.

  Each tile is a link to the list already filtered that way, so the number is
  also the way in. When all three are zero the strip collapses to a single line
  saying so, rather than three zeroes that look like something is broken.
*/
export function AttentionBar({
  overdue,
  dueToday,
  uncontacted,
}: {
  overdue: number;
  dueToday: number;
  uncontacted: number;
}) {
  const { t } = useLanguage();

  if (overdue === 0 && dueToday === 0 && uncontacted === 0) {
    return (
      <p className="flex items-center gap-2 rounded-xl border border-[#27af90]/30 bg-[#27af90]/10 px-4 py-3 text-sm text-foreground">
        <CheckCircle2Icon
          className="size-4 shrink-0 text-[#27af90] dark:text-[#4dc9a8]"
          aria-hidden="true"
        />
        {t.enquiries.attention.allClear}
      </p>
    );
  }

  return (
    <section aria-label={t.enquiries.attention.heading} className="grid gap-3 sm:grid-cols-3">
      <Tile
        href="/enquiries/follow-ups"
        count={overdue}
        label={t.enquiries.attention.overdue}
        hint={t.enquiries.attention.overdueHint}
        icon={<AlarmClockIcon className="size-4" aria-hidden="true" />}
        tone="urgent"
      />
      <Tile
        href="/enquiries/follow-ups"
        count={dueToday}
        label={t.enquiries.attention.dueToday}
        hint={t.enquiries.attention.dueTodayHint}
        icon={<PhoneCallIcon className="size-4" aria-hidden="true" />}
        tone="today"
      />
      <Tile
        href={enquiriesHref({ status: "NEW" })}
        count={uncontacted}
        label={t.enquiries.attention.uncontacted}
        hint={t.enquiries.attention.uncontactedHint}
        icon={<UserPlusIcon className="size-4" aria-hidden="true" />}
        tone="neutral"
      />
    </section>
  );
}

const TONES = {
  urgent: {
    wrapper: "border-[#f87483]/40 bg-[#f87483]/[0.07]",
    count: "text-[#f87483] dark:text-[#f8919c]",
  },
  today: { wrapper: "border-primary/30 bg-primary/[0.06]", count: "text-primary" },
  neutral: { wrapper: "border-border bg-card", count: "text-foreground" },
} as const;

function Tile({
  href,
  count,
  label,
  hint,
  icon,
  tone,
}: {
  href: string;
  count: number;
  label: string;
  hint: string;
  icon: React.ReactNode;
  tone: keyof typeof TONES;
}) {
  // A zero still renders, but muted — the reader learns the strip's shape once
  // and then reads it by position rather than re-parsing it every morning.
  const styles = count === 0 ? TONES.neutral : TONES[tone];

  return (
    <Link
      href={href}
      className={`flex items-start gap-3 rounded-xl border p-4 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${styles.wrapper}`}
    >
      <span
        className={`mt-0.5 shrink-0 ${count === 0 ? "text-muted-foreground" : styles.count}`}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="flex items-baseline gap-2">
          <span
            className={`font-heading text-2xl font-bold leading-none ${
              count === 0 ? "text-muted-foreground" : styles.count
            }`}
          >
            {count}
          </span>
          <span className="text-sm font-medium text-foreground">{label}</span>
        </span>
        <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>
      </span>
    </Link>
  );
}
