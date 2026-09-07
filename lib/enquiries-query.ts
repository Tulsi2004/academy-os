import type { EnquiryWhereInput } from "@/generated/prisma/models";
import { EnquiryStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export const ENQUIRIES_PAGE_SIZE = 25;

// An enquiry that was admitted or lost is finished — it never appears in a
// follow-up queue no matter what date is on it.
const CLOSED: EnquiryStatus[] = ["ADMITTED", "LOST"];

/** Exclusive upper bound for "due today or earlier". */
function endOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
}

/*
  "Due" and "not due" are written out separately rather than as `NOT dueWhere`.
  In SQL, `NOT (followUpDate < x AND ...)` evaluates to NULL for rows with no
  follow-up date, so those rows would fall out of both halves and vanish from
  the list entirely.
*/
export function dueFollowUpWhere(): EnquiryWhereInput {
  return { followUpDate: { lt: endOfToday() }, status: { notIn: CLOSED } };
}

function notDueWhere(): EnquiryWhereInput {
  return {
    OR: [
      { followUpDate: null },
      { followUpDate: { gte: endOfToday() } },
      { status: { in: CLOSED } },
    ],
  };
}

/*
  Stored numbers are bare national digits, but a receptionist searching may
  paste "+91 93266…" or "093266…". Search is partial, so the saved-number
  normaliser can't be reused directly — it expects a complete number. Instead we
  try each plausible reading of what was typed.
*/
function phoneCandidates(term: string): string[] {
  /*
    Only treat the term as a phone search when the whole thing is a number.
    Pulling the digits out of any query is wrong: "Test2" would search phones
    for "2" and match nearly every row. Three digits is the floor — shorter
    fragments match too much to be useful.
  */
  const compact = term.replace(/[\s()+.-]/g, "");
  if (!/^\d+$/.test(compact) || compact.length < 3) return [];

  const digits = compact;
  const candidates = new Set<string>([digits]);

  const withoutTrunk = digits.replace(/^0+/, "");
  if (withoutTrunk) candidates.add(withoutTrunk);

  // Only treat a leading "91" as the country code when the typed text says so
  // (a "+91" or "0" prefix) or the number is too long to be national. In a bare
  // short query, "91…" is far more likely to be the start of the number itself.
  const hasCountryCode = /^\s*(?:\+\s*91|0)/.test(term) || withoutTrunk.length > 10;
  if (hasCountryCode && withoutTrunk.startsWith("91")) {
    const national = withoutTrunk.slice(2);
    if (national) candidates.add(national);
  }

  return [...candidates];
}

function searchWhere(q: string | undefined): EnquiryWhereInput | null {
  const term = q?.trim();
  if (!term) return null;

  const or: EnquiryWhereInput[] = [
    { studentName: { contains: term, mode: "insensitive" } },
    ...phoneCandidates(term).map((phone) => ({ phone: { contains: phone } })),
  ];
  return { OR: or };
}

const ROW_SELECT = {
  id: true,
  studentName: true,
  phone: true,
  interestedIn: true,
  status: true,
  followUpDate: true,
  createdAt: true,
} as const;

export type EnquiryListResult = {
  rows: Awaited<ReturnType<typeof prisma.enquiry.findMany<{ select: typeof ROW_SELECT }>>>;
  total: number;
  page: number;
  pageCount: number;
  dueCount: number;
};

/*
  Sorted follow-ups-due-first, then newest. That ordering can't be expressed in
  a single `orderBy`, so the list is two disjoint queries stitched together at
  the page boundary: due enquiries by soonest date, then everything else by
  newest. Both halves carry the same organization filter — there is no code path
  here that reads across tenants.
*/
export async function listEnquiries({
  organizationId,
  q,
  status,
  page,
}: {
  organizationId: string;
  q?: string;
  status?: EnquiryStatus;
  page: number;
}): Promise<EnquiryListResult> {
  const filters: EnquiryWhereInput[] = [{ organizationId }];
  const search = searchWhere(q);
  if (search) filters.push(search);
  if (status) filters.push({ status });

  const due: EnquiryWhereInput = { AND: [...filters, dueFollowUpWhere()] };
  const rest: EnquiryWhereInput = { AND: [...filters, notDueWhere()] };

  const [dueCount, restCount] = await Promise.all([
    prisma.enquiry.count({ where: due }),
    prisma.enquiry.count({ where: rest }),
  ]);

  const total = dueCount + restCount;
  const pageCount = Math.max(1, Math.ceil(total / ENQUIRIES_PAGE_SIZE));
  const current = Math.min(Math.max(1, page), pageCount);
  const offset = (current - 1) * ENQUIRIES_PAGE_SIZE;

  const rows: EnquiryListResult["rows"] = [];

  if (offset < dueCount) {
    rows.push(
      ...(await prisma.enquiry.findMany({
        where: due,
        orderBy: [{ followUpDate: "asc" }, { createdAt: "desc" }],
        skip: offset,
        take: Math.min(ENQUIRIES_PAGE_SIZE, dueCount - offset),
        select: ROW_SELECT,
      })),
    );
  }

  if (rows.length < ENQUIRIES_PAGE_SIZE) {
    rows.push(
      ...(await prisma.enquiry.findMany({
        where: rest,
        orderBy: { createdAt: "desc" },
        skip: Math.max(0, offset - dueCount),
        take: ENQUIRIES_PAGE_SIZE - rows.length,
        select: ROW_SELECT,
      })),
    );
  }

  return { rows, total, page: current, pageCount, dueCount };
}
