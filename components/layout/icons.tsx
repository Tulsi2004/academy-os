import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function base(children: React.ReactNode) {
  return function Icon(props: IconProps) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        {children}
      </svg>
    );
  };
}

export const DashboardIcon = base(
  <>
    <rect x="3" y="3" width="8" height="8" rx="1.5" />
    <rect x="13" y="3" width="8" height="5" rx="1.5" />
    <rect x="13" y="10" width="8" height="11" rx="1.5" />
    <rect x="3" y="13" width="8" height="8" rx="1.5" />
  </>,
);

export const EnquiriesIcon = base(
  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />,
);

export const StudentsIcon = base(
  <>
    <path d="M22 10 12 5 2 10l10 5 10-5Z" />
    <path d="M6 12v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5" />
  </>,
);

export const ParentsIcon = base(
  <>
    <circle cx="9" cy="7" r="3.25" />
    <path d="M2.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5" />
    <circle cx="17.5" cy="8" r="2.5" />
    <path d="M21.5 20c0-2.9-1.9-5.3-4.5-6.1" />
  </>,
);

export const CoursesIcon = base(
  <>
    <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H19v16H5.5A1.5 1.5 0 0 0 4 20.5v-16Z" />
    <path d="M4 17.5A1.5 1.5 0 0 1 5.5 16H19" />
  </>,
);

export const BatchesIcon = base(
  <>
    <path d="m12 3 9 4.5-9 4.5-9-4.5L12 3Z" />
    <path d="m3 12 9 4.5 9-4.5" />
    <path d="m3 16.5 9 4.5 9-4.5" />
  </>,
);

export const TeachersIcon = base(
  <>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    <path d="m9.5 12.5 2 2 3.5-4" />
  </>,
);

export const AttendanceIcon = base(
  <>
    <rect x="3.5" y="4.5" width="17" height="16" rx="2" />
    <path d="M3.5 9h17" />
    <path d="M8 3v3M16 3v3" />
    <path d="m8.5 14 2 2 4-4" />
  </>,
);

export const FeesIcon = base(
  <>
    <rect x="2.5" y="6" width="19" height="13" rx="2" />
    <path d="M2.5 10.5h19" />
    <path d="M6 15h4" />
  </>,
);

export const EventsIcon = base(
  <>
    <rect x="3.5" y="4.5" width="17" height="16" rx="2" />
    <path d="M3.5 9h17" />
    <path d="M8 3v3M16 3v3" />
    <circle cx="15.5" cy="15" r="2.5" />
    <path d="M15.5 14v1l.75.5" />
  </>,
);

export const ExamsIcon = base(
  <>
    <path d="M8 3.5h8a1.5 1.5 0 0 1 1.5 1.5v15l-5.5-3-5.5 3v-15A1.5 1.5 0 0 1 8 3.5Z" />
    <path d="M9 8h6M9 11.5h6" />
  </>,
);

export const DocumentsIcon = base(
  <>
    <path d="M6 3h8l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
    <path d="M14 3v5h5" />
    <path d="M8.5 13h7M8.5 16.5h7" />
  </>,
);

export const SettingsIcon = base(
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.14.43.75 1.51 1.51 1.51H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
  </>,
);

export const MenuIcon = base(<path d="M3.5 6.5h17M3.5 12h17M3.5 17.5h17" />);

export const CloseIcon = base(<path d="M6 6l12 12M18 6 6 18" />);

export const SearchIcon = base(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </>,
);

export const BellIcon = base(
  <>
    <path d="M6 8a6 6 0 1 1 12 0c0 4.5 1.5 6 1.5 6h-15S6 12.5 6 8Z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </>,
);

export const ChevronDownIcon = base(<path d="m6 9 6 6 6-6" />);

export const LogoMarkIcon = base(
  <>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <path d="M8 15.5V9.5l4-2.2 4 2.2v6" />
    <path d="M8 12.5 12 14.7l4-2.2" />
  </>,
);
