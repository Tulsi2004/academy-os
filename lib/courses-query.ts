import { prisma } from "@/lib/prisma";

/** What a course looks like to any picker that offers one. */
export type CourseOption = { id: string; name: string };

/*
  Feeds every course dropdown in the product. Inactive courses are excluded on
  purpose — archiving a course is how an academy stops it being offered without
  destroying the enquiries and batches that already reference it.
*/
export async function listCourseOptions(organizationId: string): Promise<CourseOption[]> {
  return prisma.course.findMany({
    where: { organizationId, active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

const ROW_SELECT = {
  id: true,
  name: true,
  description: true,
  active: true,
  createdAt: true,
  // What the course is actually worth knowing about at a glance: whether
  // anything hangs off it yet. Archiving one with live batches is a different
  // decision from archiving one nobody ever used.
  _count: { select: { batches: true, enquiries: true } },
} as const;

export type CourseRow = Awaited<
  ReturnType<typeof prisma.course.findMany<{ select: typeof ROW_SELECT }>>
>[number];

/*
  The whole list, unpaginated. An academy teaches a handful of courses, not
  hundreds — paginating this would be machinery for a problem that does not
  exist. Active first, so the archived ones sink to the bottom.
*/
export async function listCourses(organizationId: string): Promise<CourseRow[]> {
  return prisma.course.findMany({
    where: { organizationId },
    orderBy: [{ active: "desc" }, { name: "asc" }],
    select: ROW_SELECT,
  });
}
