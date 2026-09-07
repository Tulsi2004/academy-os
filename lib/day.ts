/*
  Day boundaries must not depend on where the code runs. A developer machine is
  on IST and Vercel is on UTC, so `new Date().getDate()` gives a different
  "today" in production than in development — today's follow-ups would drop out
  of the Follow-ups view between midnight and 05:30 IST, and relative labels
  like "Today" would be a day out for that whole window.

  Everything that decides what day something falls on goes through here.
*/
export const ACADEMY_TIME_ZONE = "Asia/Kolkata";

const PARTS = new Intl.DateTimeFormat("en-US", {
  timeZone: ACADEMY_TIME_ZONE,
  hour12: false,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

/** How far the academy's wall clock is ahead of UTC at this instant. */
function zoneOffsetMs(date: Date): number {
  const parts: Record<string, number> = {};
  for (const part of PARTS.formatToParts(date)) {
    if (part.type !== "literal") parts[part.type] = Number(part.value);
  }
  const asIfUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    // Intl renders midnight as hour 24 in some engines.
    parts.hour % 24,
    parts.minute,
    parts.second,
  );
  /*
    Intl only reports down to the second, so the raw difference carries the
    input's milliseconds and the "midnight" derived from it lands a few hundred
    ms off. Every real UTC offset is a whole number of minutes, so rounding to
    the minute removes the drift exactly.
  */
  return Math.round((asIfUtc - date.getTime()) / 60_000) * 60_000;
}

/** The instant at which the academy's day containing `date` began. */
export function startOfAcademyDay(date: Date = new Date()): Date {
  const offset = zoneOffsetMs(date);
  const wallClock = new Date(date.getTime() + offset);
  const midnight = Date.UTC(
    wallClock.getUTCFullYear(),
    wallClock.getUTCMonth(),
    wallClock.getUTCDate(),
  );
  return new Date(midnight - offset);
}

/** `days` academy-days after the start of the day containing `date`. */
export function addAcademyDays(days: number, date: Date = new Date()): Date {
  const start = startOfAcademyDay(date);
  // Re-resolve the offset at the target date so a zone with DST lands on its
  // own midnight rather than shifting by an hour. India has no DST, but this
  // shouldn't silently break if the academy is ever somewhere that does.
  return startOfAcademyDay(new Date(start.getTime() + days * 86_400_000 + 3_600_000 * 12));
}

/** Whole academy-days from today to `date`. Negative means the past. */
export function academyDaysFromToday(date: Date, now: Date = new Date()): number {
  const today = startOfAcademyDay(now).getTime();
  const target = startOfAcademyDay(date).getTime();
  return Math.round((target - today) / 86_400_000);
}
