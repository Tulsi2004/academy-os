import { ACADEMY_TIME_ZONE, startOfAcademyDay } from "@/lib/day";

/** A student's display name. `lastName` is optional throughout the product. */
export function studentName(student: { firstName: string; lastName: string | null }): string {
  return [student.firstName, student.lastName].filter(Boolean).join(" ");
}

/*
  Age matters to an academy — it is how a child is placed in the right batch —
  and a date of birth alone makes the reader do the arithmetic. Computed against
  the academy's day so it does not tick over at the wrong midnight.
*/
export function ageInYears(dateOfBirth: Date, now: Date = new Date()): number {
  const born = startOfAcademyDay(dateOfBirth);
  const today = startOfAcademyDay(now);

  let age = today.getUTCFullYear() - born.getUTCFullYear();
  const monthDiff = today.getUTCMonth() - born.getUTCMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getUTCDate() < born.getUTCDate())) age -= 1;

  return Math.max(0, age);
}

export function formatDateOfBirth(dateOfBirth: Date): string {
  const formatted = dateOfBirth.toLocaleDateString("en-IN", {
    timeZone: ACADEMY_TIME_ZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  return `${formatted} · ${ageInYears(dateOfBirth)} yrs`;
}

/*
  Search and page live in the URL so the view survives a refresh, the back
  button and a shared link — the same contract the enquiry list keeps.
*/
export function studentsHref({ q, page }: { q?: string; page?: number }) {
  const params = new URLSearchParams();
  if (q?.trim()) params.set("q", q.trim());
  if (page && page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/students?${query}` : "/students";
}
