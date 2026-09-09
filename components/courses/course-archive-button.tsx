"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { setCourseActive } from "@/lib/actions/courses";

/*
  Archive, never delete. Batches and enquiries point at a course, so the row has
  to survive; withdrawing it from the dropdowns is the actual intent.
*/
export function CourseArchiveButton({
  id,
  name,
  active,
}: {
  id: string;
  name: string;
  active: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setPending(true);
    setError(null);
    try {
      const result = await setCourseActive(id, !active);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    } catch {
      setError("Could not update the course.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={pending}
        onClick={toggle}
        aria-label={`${active ? "Archive" : "Restore"} ${name}`}
      >
        {pending ? "Saving…" : active ? "Archive" : "Restore"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
