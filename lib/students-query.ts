import type { StudentWhereInput } from "@/generated/prisma/models";
import { prisma } from "@/lib/prisma";
import { phoneCandidates } from "@/lib/phone-search";

export const STUDENTS_PAGE_SIZE = 25;

/*
  A student is found by the parent's phone as often as by their own name — the
  number on file is usually the parent's, and it is what a parent gives at the
  desk. Both sides of that relationship are searched, along with the parent's
  name, because "Sharma's daughter" is how reception actually thinks.
*/
function searchWhere(q: string | undefined): StudentWhereInput | null {
  const term = q?.trim();
  if (!term) return null;

  const or: StudentWhereInput[] = [];

  /*
    "Kavya Sharma" spans two columns, so a single `contains` would miss it.
    Every token has to match somewhere in the name, which keeps "Kavya",
    "Sharma" and "Kavya Sharma" all working without matching every student who
    happens to share one common token.
  */
  const tokens = term.split(/\s+/).filter(Boolean);
  if (tokens.length > 0) {
    or.push({
      AND: tokens.map((token) => ({
        OR: [
          { firstName: { contains: token, mode: "insensitive" as const } },
          { lastName: { contains: token, mode: "insensitive" as const } },
        ],
      })),
    });
    or.push({
      parent: {
        is: {
          AND: tokens.map((token) => ({
            name: { contains: token, mode: "insensitive" as const },
          })),
        },
      },
    });
  }

  for (const phone of phoneCandidates(term)) {
    or.push({ phone: { contains: phone } });
    or.push({ parent: { is: { phone: { contains: phone } } } });
  }

  return { OR: or };
}

const ROW_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  phone: true,
  createdAt: true,
  parent: { select: { name: true, phone: true } },
  _count: { select: { enrollments: true } },
} as const;

export type StudentRow = Awaited<
  ReturnType<typeof prisma.student.findMany<{ select: typeof ROW_SELECT }>>
>[number];

export type StudentListResult = {
  rows: StudentRow[];
  total: number;
  page: number;
  pageCount: number;
};

/*
  Newest first: the students an academy looks up are overwhelmingly the ones who
  just joined. Every query here is filtered on `organizationId` — there is no
  code path that reads across tenants.
*/
export async function listStudents({
  organizationId,
  q,
  page,
}: {
  organizationId: string;
  q?: string;
  page: number;
}): Promise<StudentListResult> {
  const filters: StudentWhereInput[] = [{ organizationId }];
  const search = searchWhere(q);
  if (search) filters.push(search);
  const where: StudentWhereInput = { AND: filters };

  const total = await prisma.student.count({ where });
  const pageCount = Math.max(1, Math.ceil(total / STUDENTS_PAGE_SIZE));
  const current = Math.min(Math.max(1, page), pageCount);

  const rows = await prisma.student.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    skip: (current - 1) * STUDENTS_PAGE_SIZE,
    take: STUDENTS_PAGE_SIZE,
    select: ROW_SELECT,
  });

  return { rows, total, page: current, pageCount };
}
