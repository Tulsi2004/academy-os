"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { EnquiryCaptureSheet } from "@/components/enquiries/enquiry-capture-sheet";
import type { CourseOption } from "@/lib/courses-query";
import { useLanguage } from "@/lib/i18n/language-provider";

/*
  The topbar already names the section, so this heading says what the screen is
  for instead of repeating the word "Enquiries" twice down the page. The count
  of what is due rides on the "To call" tab, which is the tab it belongs to.

  Solid primary is spent on exactly one control here: "New enquiry". The tabs
  only switch between two views of the same list, so they read as a recessed
  track with a raised thumb — when both were filled purple pills, the only
  action on the screen looked like a third tab.
*/
export function EnquiriesHeader({
  courses,
  dueCount = 0,
}: {
  courses: CourseOption[];
  dueCount?: number;
}) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const onFollowUps = pathname === "/enquiries/follow-ups";
  const heading = onFollowUps ? t.followUps.title : t.enquiries.title;
  const subtitle = onFollowUps ? t.followUps.subtitle : t.enquiries.subtitle;

  const tabs = [
    { href: "/enquiries", label: t.enquiries.tabs.all, badge: 0 },
    { href: "/enquiries/follow-ups", label: t.enquiries.tabs.followUps, badge: dueCount },
  ];

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">{heading}</h2>
        <p className="mt-1 max-w-prose text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <nav className="flex items-center gap-1 rounded-full bg-muted p-1">
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
                {tab.badge > 0 && (
                  <span className="rounded-full bg-[#f87483]/15 px-1.5 text-xs font-semibold text-[#f87483] dark:text-[#f8919c]">
                    {tab.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <EnquiryCaptureSheet courses={courses} />
      </div>
    </div>
  );
}
