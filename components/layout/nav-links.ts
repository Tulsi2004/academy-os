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
};

export const navLinks: NavLink[] = [
  { href: "/", label: "Dashboard", icon: DashboardIcon },
  { href: "/enquiries", label: "Enquiries", icon: EnquiriesIcon },
  { href: "/students", label: "Students", icon: StudentsIcon },
  { href: "/parents", label: "Parents", icon: ParentsIcon },
  { href: "/courses", label: "Courses", icon: CoursesIcon },
  { href: "/batches", label: "Batches", icon: BatchesIcon },
  { href: "/teachers", label: "Teachers", icon: TeachersIcon },
  { href: "/attendance", label: "Attendance", icon: AttendanceIcon },
  { href: "/fees", label: "Fees", icon: FeesIcon },
  { href: "/events", label: "Events", icon: EventsIcon },
  { href: "/exams", label: "Exams", icon: ExamsIcon },
  { href: "/documents", label: "Documents", icon: DocumentsIcon },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

export function matchNavLink(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
