import type { EnquiryWhereInput } from "@/generated/prisma/models";
import { EnquiryStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { addAcademyDays } from "@/lib/day";
import { phoneCandidates } from "@/lib/phone-search";

export const ENQUIRIES_PAGE_SIZE = 25;

// An enquiry that was admitted or lost is finished — it never appears in a
// follow-up queue no matter what date is on it.
const CLOSED: EnquiryStatus[] = ["ADMITTED", "LOST"];

/** Exclusive upper bound for "due today or earlier", in the academy's timezone. */
function endOfToday(): Date {
  return addAcademyDays(1);
}

/** Inclusive lower bound for "due today", in the academy's timezone. */
function startOfToday(): Date {
  return addAcademyDays(0);
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

/** Strictly before today — the promised date has already gone past. */
function overdueWhere(): EnquiryWhereInput {
  return { followUpDate: { lt: startOfToday() }, status: { notIn: CLOSED } };
}

function dueTodayWhere(): EnquiryWhereInput {
  return {
    followUpDate: { gte: startOfToday(), lt: endOfToday() },
    status: { notIn: CLOSED },
  };
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

export const ROW_SELECT = {
  id: true,
  studentName: true,
  phone: true,
  interestedIn: true,
  status: true,
  followUpDate: true,
  createdAt: true,
  // The list shows the named course when nobody typed anything into the
  // free-text field, so a row is never blank in the column that says what the
  // person actually wants to learn.
  course: { select: { name: true } },
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
        orderBy: [{ followUpDate: "asc" }, { createdAt: "desc" }, { id: "asc" }],
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
        orderBy: [{ createdAt: "desc" }, { id: "asc" }],
        skip: Math.max(0, offset - dueCount),
        take: ENQUIRIES_PAGE_SIZE - rows.length,
        select: ROW_SELECT,
      })),
    );
  }

  return { rows, total, page: current, pageCount, dueCount };
}


export type EnquirySummary = {
  /** Everything matching the current search, before the status filter. */
  total: number;
  overdue: number;
  dueToday: number;
  byStatus: Record<EnquiryStatus, number>;
};

const EMPTY_STATUS_COUNTS = (): Record<EnquiryStatus, number> =>
  Object.fromEntries(Object.values(EnquiryStatus).map((status) => [status, 0])) as Record<
    EnquiryStatus,
    number
  >;

/*
  Counts for the attention strip and the filter chips. Deliberately ignores the
  status filter — a chip that only counted the status you are already looking at
  would read "All (3)" while showing three of forty rows. It does respect the
  search, so the chips describe the list you are actually looking at.
*/
export async function enquirySummary({
  organizationId,
  q,
}: {
  organizationId: string;
  q?: string;
}): Promise<EnquirySummary> {
  const filters: EnquiryWhereInput[] = [{ organizationId }];
  const search = searchWhere(q);
  if (search) filters.push(search);
  const base: EnquiryWhereInput = { AND: filters };

  const [grouped, overdue, dueToday] = await Promise.all([
    prisma.enquiry.groupBy({ by: ["status"], where: base, _count: { _all: true } }),
    prisma.enquiry.count({ where: { AND: [...filters, overdueWhere()] } }),
    prisma.enquiry.count({ where: { AND: [...filters, dueTodayWhere()] } }),
  ]);

  const byStatus = EMPTY_STATUS_COUNTS();
  let total = 0;
  for (const row of grouped) {
    byStatus[row.status] = row._count._all;
    total += row._count._all;
  }

  return { total, overdue, dueToday, byStatus };
}

/*
  The number on the "To call" tab. Deliberately unfiltered: it answers "how much
  is waiting for me overall", so it must not shrink because the reader happens to
  be searching for one name or looking at a single status.
*/
export async function dueFollowUpCount(organizationId: string): Promise<number> {
  return prisma.enquiry.count({ where: { AND: [{ organizationId }, dueFollowUpWhere()] } });
}
