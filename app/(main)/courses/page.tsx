import { requireOrgContext } from "@/lib/auth/org-context";
import { getLocale } from "@/lib/i18n/server";
import { intlLocale } from "@/lib/i18n/locales";
import { listCourses, type CourseRow } from "@/lib/courses-query";
import { formatDate } from "@/lib/enquiries";
import { CourseArchiveButton } from "@/components/courses/course-archive-button";
import { CourseCreateSheet } from "@/components/courses/course-create-sheet";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const { organizationId } = await requireOrgContext();
  const [courses, locale] = await Promise.all([listCourses(organizationId), getLocale()]);
  const intl = intlLocale(locale);

  const activeCount = courses.filter((course) => course.active).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Courses</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            The subjects your academy teaches. These are what an enquiry can be about.
          </p>
        </div>
        {courses.length > 0 && <CourseCreateSheet />}
      </div>

      {courses.length === 0 ? (
        <div className="flex min-h-60 items-center justify-center rounded-xl border border-dashed border-border bg-card">
          <div className="max-w-sm px-6 text-center">
            <p className="text-sm text-muted-foreground">
              No courses yet. Add the ones you teach and they become selectable on
              every new enquiry.
            </p>
            <CourseCreateSheet label="Add your first course" className="mt-3" />
          </div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full min-w-160 text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Course</th>
                  <th className="px-4 py-3 font-medium">Batches</th>
                  <th className="px-4 py-3 font-medium">Enquiries</th>
                  <th className="px-4 py-3 font-medium">Added</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {courses.map((course) => (
                  <CourseRowCells key={course.id} course={course} intl={intl} />
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-sm text-muted-foreground">
            {activeCount} active {activeCount === 1 ? "course" : "courses"}
            {courses.length > activeCount && ` · ${courses.length - activeCount} archived`}
          </p>
        </>
      )}
    </div>
  );
}

function CourseRowCells({ course, intl }: { course: CourseRow; intl: string }) {
  return (
    <tr className={course.active ? "" : "bg-muted/30"}>
      <td className="px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`font-medium ${course.active ? "text-foreground" : "text-muted-foreground"}`}>
            {course.name}
          </span>
          {!course.active && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              Archived
            </span>
          )}
        </div>
        {course.description && (
          <p className="mt-0.5 max-w-md text-xs text-muted-foreground">{course.description}</p>
        )}
      </td>
      <td className="px-4 py-3 text-muted-foreground">{course._count.batches}</td>
      <td className="px-4 py-3 text-muted-foreground">{course._count.enquiries}</td>
      <td className="px-4 py-3 text-muted-foreground">{formatDate(course.createdAt, intl)}</td>
      <td className="px-4 py-3">
        <CourseArchiveButton id={course.id} name={course.name} active={course.active} />
      </td>
    </tr>
  );
}
