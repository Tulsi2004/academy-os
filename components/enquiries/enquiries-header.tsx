"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const tabs = [
  { href: "/enquiries", label: "All enquiries" },
  { href: "/enquiries/follow-ups", label: "Follow-ups" },
];

export function EnquiriesHeader() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Enquiries</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Track and follow up with prospective students.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <nav className="flex items-center gap-1 rounded-full border border-border bg-card p-1">
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
        <Button size="lg" nativeButton={false} render={<Link href="/enquiries/new" />}>
          New Enquiry
        </Button>
      </div>
    </div>
  );
}
