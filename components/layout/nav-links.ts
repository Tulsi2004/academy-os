import {
  AttendanceIcon,
  BatchesIcon,
  CoursesIcon,
  DashboardIcon,
  DocumentsIcon,
  EnquiriesIcon,
  EventsIcon,
  ExamsIcon,
  FeesIcon,
  ParentsIcon,
  SettingsIcon,
  StudentsIcon,
  TeachersIcon,
} from "@/components/layout/icons";
import type { ComponentType, SVGProps } from "react";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";

export type NavLink = {
  href: string;
  // The key, not the words. Sidebar and topbar look it up in the reader's
  // dictionary, so a new module cannot ship with an untranslatable label.
  labelKey: keyof Dictionary["nav"];
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  // Set on modules that still render `PlaceholderPage` — the sidebar badges
  // these so nobody clicks through expecting a working screen. Drop the flag
  // when the module's page is built.
  comingSoon?: boolean;
};

export const navLinks: NavLink[] = [
  { href: "/", labelKey: "dashboard", icon: DashboardIcon, comingSoon: true },
  { href: "/enquiries", labelKey: "enquiries", icon: EnquiriesIcon },
  { href: "/students", labelKey: "students", icon: StudentsIcon },
  { href: "/parents", labelKey: "parents", icon: ParentsIcon, comingSoon: true },
  { href: "/courses", labelKey: "courses", icon: CoursesIcon },
  { href: "/batches", labelKey: "batches", icon: BatchesIcon, comingSoon: true },
  { href: "/teachers", labelKey: "teachers", icon: TeachersIcon, comingSoon: true },
  { href: "/attendance", labelKey: "attendance", icon: AttendanceIcon, comingSoon: true },
  { href: "/fees", labelKey: "fees", icon: FeesIcon, comingSoon: true },
  { href: "/events", labelKey: "events", icon: EventsIcon, comingSoon: true },
  { href: "/exams", labelKey: "exams", icon: ExamsIcon, comingSoon: true },
  { href: "/documents", labelKey: "documents", icon: DocumentsIcon, comingSoon: true },
  { href: "/settings", labelKey: "settings", icon: SettingsIcon, comingSoon: true },
];

export function matchNavLink(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
