"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/enquiries", label: "All enquiries" },
  { href: "/enquiries/follow-ups", label: "Follow-ups" },
];

export function EnquiriesHeader() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Enquiries</h2>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Track and follow up with prospective students.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <nav className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-zinc-900">
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-indigo-600 text-white"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/enquiries/new"
          className="inline-flex items-center rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          New Enquiry
        </Link>
      </div>
    </div>
  );
}
