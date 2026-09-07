"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { enquiriesHref } from "@/lib/enquiries";

/*
  The URL is the source of truth. `draft` only shadows it between a keystroke
  and the debounced navigation, and is keyed to the query it was typed against
  — so the back button restores the box without an effect writing state.
*/
export function EnquiriesSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = searchParams.get("q") ?? "";
  const status = searchParams.get("status") ?? undefined;

  const [draft, setDraft] = useState<{ base: string; value: string } | null>(null);
  const value = draft && draft.base === q ? draft.value : q;

  const pending = value !== q;

  useEffect(() => {
    if (!pending) return;
    const timer = setTimeout(() => {
      // Any change to the query resets to page 1 — page 4 of the old result set
      // is meaningless against the new one.
      router.replace(enquiriesHref({ q: value, status }), { scroll: false });
    }, 300);
    return () => clearTimeout(timer);
  }, [pending, value, status, router]);

  return (
    <Input
      type="search"
      name="q"
      value={value}
      onChange={(event) => setDraft({ base: q, value: event.target.value })}
      placeholder="Search name or phone…"
      aria-label="Search enquiries"
      className="h-9 w-full sm:max-w-xs"
    />
  );
}
