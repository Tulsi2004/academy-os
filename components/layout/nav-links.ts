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

export type NavLink = {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  // Set on modules that still render `PlaceholderPage` — the sidebar badges
  // these so nobody clicks through expecting a working screen. Drop the flag
  // when the module's page is built.
  comingSoon?: boolean;
};

export const navLinks: NavLink[] = [
  { href: "/", label: "Dashboard", icon: DashboardIcon, comingSoon: true },
  { href: "/enquiries", label: "Enquiries", icon: EnquiriesIcon },
  { href: "/students", label: "Students", icon: StudentsIcon, comingSoon: true },
  { href: "/parents", label: "Parents", icon: ParentsIcon, comingSoon: true },
  { href: "/courses", label: "Courses", icon: CoursesIcon, comingSoon: true },
  { href: "/batches", label: "Batches", icon: BatchesIcon, comingSoon: true },
  { href: "/teachers", label: "Teachers", icon: TeachersIcon, comingSoon: true },
  { href: "/attendance", label: "Attendance", icon: AttendanceIcon, comingSoon: true },
  { href: "/fees", label: "Fees", icon: FeesIcon, comingSoon: true },
  { href: "/events", label: "Events", icon: EventsIcon, comingSoon: true },
  { href: "/exams", label: "Exams", icon: ExamsIcon, comingSoon: true },
  { href: "/documents", label: "Documents", icon: DocumentsIcon, comingSoon: true },
  { href: "/settings", label: "Settings", icon: SettingsIcon, comingSoon: true },
];

export function matchNavLink(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
