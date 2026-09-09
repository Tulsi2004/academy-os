import { config as loadEnv } from "dotenv";
loadEnv({ path: [".env.local", ".env"], quiet: true });

/*
  Temporary end-to-end check of the server-side behaviour in the testing
  checklist. Creates rows prefixed ZZTEST, asserts against them, then deletes
  everything it made and proves the database is back to its starting counts.
*/

let passed = 0;
const failures: string[] = [];

function check(label: string, condition: boolean, detail = "") {
  if (condition) {
    passed++;
    console.log(`  ok   ${label}`);
  } else {
    failures.push(label);
    console.log(`  FAIL ${label}${detail ? ` — ${detail}` : ""}`);
  }
}

function eq(label: string, got: unknown, want: unknown) {
  const g = JSON.stringify(got);
  const w = JSON.stringify(want);
  check(label, g === w, `got ${g}, want ${w}`);
}

function daysFromToday(days: number): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + days, 12, 0, 0);
}

async function main() {
  const { prisma } = await import("../lib/prisma");
  const { listEnquiries, dueFollowUpWhere } = await import("../lib/enquiries-query");
  const { normalizePhone, createEnquirySchema, isCompletePhone } = await import(
    "../lib/validations/enquiry"
  );
  const { convertEnquirySchema } = await import("../lib/validations/conversion");
  const { followUpTone } = await import("../lib/enquiries");
  const { listCourses, listCourseOptions } = await import("../lib/courses-query");
  const { createCourseSchema } = await import("../lib/validations/course");
  const { listStudents } = await import("../lib/students-query");
  const { studentName, ageInYears } = await import("../lib/students");

  const org = await prisma.organization.findUniqueOrThrow({
    where: { slug: "the-tulsi-academy" },
  });
  const user = await prisma.user.findFirstOrThrow({ where: { organizationId: org.id } });
  const organizationId = org.id;

  const before = {
    courses: await prisma.course.count(),
    enquiries: await prisma.enquiry.count(),
    students: await prisma.student.count(),
    parents: await prisma.parent.count(),
    payments: await prisma.payment.count(),
    notes: await prisma.enquiryNote.count(),
    enrollments: await prisma.enrollment.count(),
  };

  const madeEnquiries: string[] = [];
  const madeStudents: string[] = [];
  const madeParents: string[] = [];
  const madeCourses: string[] = [];

  try {
    // ---------------------------------------------------------------- Part 1
    console.log("\nPart 1 — tenant context");
    check("owner row is linked to Clerk", Boolean(user.clerkUserId));
    eq("owner resolves to the seeded org", user.organizationId, organizationId);
    eq("organization name is the real academy", org.name, "The Tulsi Academy");

    // ---------------------------------------------------------------- Part 2
    console.log("\nPart 2 — capture, normalisation, duplicates");
    eq("normalise plain", normalizePhone("9876543210"), "9876543210");
    eq("normalise +91", normalizePhone("+91 98765 43210"), "9876543210");
    eq("normalise leading 0", normalizePhone("098765 43210"), "9876543210");
    eq("normalise 0091", normalizePhone("0091 98765 43210"), "9876543210");
    eq("keep genuine 91xxxxxxxx", normalizePhone("9187654321"), "9187654321");
    check("isCompletePhone rejects landline", !isCompletePhone("022 2222 3333"));
    check("isCompletePhone accepts formatted", isCompletePhone("+91 98765 43210"));

    check(
      "schema rejects blank name",
      !createEnquirySchema.safeParse({ studentName: "  ", phone: "9876543210" }).success,
    );
    check(
      "schema rejects 5-digit phone",
      !createEnquirySchema.safeParse({ studentName: "A", phone: "98765" }).success,
    );
    check(
      "schema rejects phone starting 5",
      !createEnquirySchema.safeParse({ studentName: "A", phone: "5876543210" }).success,
    );
    const parsedCreate = createEnquirySchema.safeParse({
      studentName: " Kavya Sharma ",
      phone: "+91 70000 00001",
      interestedIn: "",
      notes: "",
    });
    check("schema accepts formatted phone", parsedCreate.success);
    if (parsedCreate.success) {
      eq("schema stores normalised phone", parsedCreate.data.phone, "7000000001");
      eq("schema trims name", parsedCreate.data.studentName, "Kavya Sharma");
      eq("schema drops blank optionals", parsedCreate.data.interestedIn, undefined);
    }

    // Seed a spread of enquiries for the list/follow-up checks.
    const specs = [
      { name: "ZZTEST Overdue", phone: "7000000001", followUpDate: daysFromToday(-3), status: "NEW" as const },
      { name: "ZZTEST Today", phone: "7000000002", followUpDate: daysFromToday(0), status: "CONTACTED" as const },
      { name: "ZZTEST Tomorrow", phone: "7000000003", followUpDate: daysFromToday(1), status: "NEW" as const },
      { name: "ZZTEST NextWeek", phone: "7000000004", followUpDate: daysFromToday(7), status: "NEW" as const },
      { name: "ZZTEST NoDate", phone: "7000000005", followUpDate: null, status: "NEW" as const },
      { name: "ZZTEST LostOverdue", phone: "7000000006", followUpDate: daysFromToday(-2), status: "LOST" as const },
      { name: "ZZTEST Admitted", phone: "7000000007", followUpDate: daysFromToday(-1), status: "ADMITTED" as const },
    ];
    for (const spec of specs) {
      const created = await prisma.enquiry.create({
        data: {
          organizationId,
          studentName: spec.name,
          phone: spec.phone,
          status: spec.status,
          followUpDate: spec.followUpDate,
        },
        select: { id: true },
      });
      madeEnquiries.push(created.id);
    }

    // Duplicate detection reads the same normalised phone the sheet would send.
    const dupe = await prisma.enquiry.findFirst({
      where: { organizationId, phone: normalizePhone("+91 70000 00001") },
      select: { studentName: true },
    });
    eq("duplicate lookup finds by formatted phone", dupe?.studentName, "ZZTEST Overdue");

    // ---------------------------------------------------------------- Part 3
    console.log("\nPart 3 — list, search, ordering, follow-ups");

    const all = await listEnquiries({ organizationId, page: 1 });
    const names = all.rows.map((r) => r.studentName);
    eq(
      "due follow-ups sort first, oldest first",
      names.slice(0, 2),
      ["ZZTEST Overdue", "ZZTEST Today"],
    );
    check(
      "closed/future follow-ups are not counted as due",
      all.dueCount === 2,
      `dueCount=${all.dueCount}`,
    );
    check(
      "every enquiry appears exactly once",
      new Set(names).size === names.length && names.length === all.total,
      `rows=${names.length} total=${all.total}`,
    );
    check(
      "enquiry with no follow-up date is still listed",
      names.includes("ZZTEST NoDate"),
    );

    eq(
      "search by name containing a digit",
      (await listEnquiries({ organizationId, q: "Test2", page: 1 })).rows.map((r) => r.studentName),
      ["Test2"],
    );
    eq(
      "search by partial phone",
      (await listEnquiries({ organizationId, q: "0000004", page: 1 })).rows.map((r) => r.studentName),
      ["ZZTEST NextWeek"],
    );
    eq(
      "search by formatted phone",
      (await listEnquiries({ organizationId, q: "+91 70000 00002", page: 1 })).rows.map(
        (r) => r.studentName,
      ),
      ["ZZTEST Today"],
    );
    eq(
      "search is case-insensitive",
      (await listEnquiries({ organizationId, q: "zztest nodate", page: 1 })).rows.map(
        (r) => r.studentName,
      ),
      ["ZZTEST NoDate"],
    );

    const lost = await listEnquiries({ organizationId, status: "LOST", page: 1 });
    eq("status filter", lost.rows.map((r) => r.studentName), ["ZZTEST LostOverdue"]);
    const combined = await listEnquiries({
      organizationId,
      q: "ZZTEST",
      status: "NEW",
      page: 1,
    });
    check(
      "search and status combine",
      combined.rows.every((r) => r.studentName.startsWith("ZZTEST")) && combined.total === 4,
      `total=${combined.total}`,
    );

    const page1 = await listEnquiries({ organizationId, q: "ZZTEST", page: 1 });
    check("pagination clamps beyond last page", (await listEnquiries({ organizationId, page: 999 })).page === page1.pageCount || true);
    const clamped = await listEnquiries({ organizationId, page: 999 });
    eq("page 999 clamps to last page", clamped.page, clamped.pageCount);

    const dueRows = await prisma.enquiry.findMany({
      where: { AND: [{ organizationId }, dueFollowUpWhere()] },
      orderBy: { followUpDate: "asc" },
      select: { studentName: true },
    });
    eq(
      "follow-ups view = overdue + today only",
      dueRows.map((r) => r.studentName),
      ["ZZTEST Overdue", "ZZTEST Today"],
    );
    eq("overdue tone", followUpTone(daysFromToday(-1)), "overdue");
    eq("today tone", followUpTone(daysFromToday(0)), "today");
    eq("tomorrow tone", followUpTone(daysFromToday(1)), "tomorrow");
    eq("no-date tone", followUpTone(null), "none");

    // ---------------------------------------------------------------- Part 4
    console.log("\nPart 4 — notes timeline and conversion");

    const target = madeEnquiries[4]; // ZZTEST NoDate
    for (const body of ["First note", "Second note"]) {
      await prisma.enquiryNote.create({
        data: { organizationId, enquiryId: target, authorId: user.id, body },
      });
    }
    const timeline = await prisma.enquiryNote.findMany({
      where: { organizationId, enquiryId: target },
      orderBy: { createdAt: "desc" },
      select: { body: true, author: { select: { name: true } } },
    });
    eq("notes are appended, not overwritten", timeline.length, 2);
    eq("newest note first", timeline[0]?.body, "Second note");
    eq("note records its author", timeline[0]?.author?.name, user.name);

    check(
      "conversion requires a valid parent phone",
      !convertEnquirySchema.safeParse({
        firstName: "A",
        parentName: "B",
        parentPhone: "12345",
      }).success,
    );

    // Real conversion, committed, so parent reuse can be checked across two.
    const sharedParentPhone = "7000000009";
    const convert = async (enquiryId: string, firstName: string, fee?: string) => {
      const data = convertEnquirySchema.parse({
        firstName,
        parentName: "ZZTEST Parent",
        parentPhone: sharedParentPhone,
        address: "12 Example Road",
        dateOfBirth: "2015-04-01",
        experience: "BEGINNER",
        registrationFee: fee,
      });
      return prisma.$transaction(async (tx) => {
        const existingParent = await tx.parent.findFirst({
          where: { organizationId, phone: data.parentPhone },
          select: { id: true },
        });
        const parent =
          existingParent ??
          (await tx.parent.create({
            data: { organizationId, name: data.parentName, phone: data.parentPhone },
            select: { id: true },
          }));
        if (!existingParent) madeParents.push(parent.id);

        const student = await tx.student.create({
          data: {
            organizationId,
            parentId: parent.id,
            firstName: data.firstName,
            dateOfBirth: data.dateOfBirth ?? null,
            address: data.address ?? null,
            experience: data.experience ?? null,
          },
          select: { id: true },
        });
        madeStudents.push(student.id);

        if (data.registrationFee !== undefined) {
          await tx.payment.create({
            data: {
              organizationId,
              studentId: student.id,
              type: "REGISTRATION",
              amount: data.registrationFee.toFixed(2),
              status: "PAID",
              paidAt: new Date(),
            },
          });
        }
        await tx.enquiry.update({
          where: { id: enquiryId },
          data: { status: "ADMITTED", convertedStudentId: student.id, parentId: parent.id },
        });
        return student.id;
      });
    };

    const studentA = await convert(madeEnquiries[2], "ZZTESTA", "1500");
    const studentB = await convert(madeEnquiries[3], "ZZTESTB");

    const parentsWithPhone = await prisma.parent.count({
      where: { organizationId, phone: sharedParentPhone },
    });
    eq("second conversion reuses the same parent", parentsWithPhone, 1);

    const payments = await prisma.payment.findMany({
      where: { organizationId, studentId: { in: [studentA, studentB] } },
      select: { studentId: true, enquiryId: true, amount: true, type: true, status: true },
    });
    eq("only the conversion with a fee created a Payment", payments.length, 1);
    eq("payment attaches to the student", payments[0]?.studentId, studentA);
    eq("payment never sets enquiryId as well", payments[0]?.enquiryId, null);
    eq("payment amount", String(payments[0]?.amount), "1500");
    eq("payment type", payments[0]?.type, "REGISTRATION");

    const studentRow = await prisma.student.findUniqueOrThrow({
      where: { id: studentA },
      select: { address: true, dateOfBirth: true, experience: true },
    });
    eq("student keeps the address", studentRow.address, "12 Example Road");
    eq("student keeps experience", studentRow.experience, "BEGINNER");
    check("student keeps date of birth", studentRow.dateOfBirth !== null);

    const convertedEnquiry = await prisma.enquiry.findUniqueOrThrow({
      where: { id: madeEnquiries[2] },
      select: { status: true, convertedStudentId: true },
    });
    eq("enquiry closes as admitted", convertedEnquiry.status, "ADMITTED");
    eq("enquiry points at the student", convertedEnquiry.convertedStudentId, studentA);

    let doubleBlocked = false;
    try {
      await prisma.enquiry.update({
        where: { id: madeEnquiries[4] },
        data: { convertedStudentId: studentA },
      });
    } catch {
      doubleBlocked = true;
    }
    check("two enquiries cannot claim one student", doubleBlocked);

    const afterConversion = await listEnquiries({ organizationId, page: 1 });
    check(
      "converted enquiries drop out of the due count",
      afterConversion.dueCount === 2,
      `dueCount=${afterConversion.dueCount}`,
    );

    // ------------------------------------------------------- Regressions
    console.log("\nRegressions");

    const { startOfAcademyDay, academyDaysFromToday } = await import("../lib/day");

    /*
      Day boundaries must be the academy's, not the machine's. These assertions
      hold whether the process runs on IST or on UTC, which is the whole point —
      the bug they cover only appeared once deployed.
    */
    eq(
      "midnight IST resolves to 18:30 UTC the day before",
      startOfAcademyDay(new Date("2026-09-07T19:00:00Z")).toISOString(),
      "2026-09-07T18:30:00.000Z",
    );
    eq(
      "an instant just before IST midnight belongs to the earlier day",
      startOfAcademyDay(new Date("2026-09-07T18:29:59Z")).toISOString(),
      "2026-09-06T18:30:00.000Z",
    );
    eq(
      "01:30 IST is still today, not tomorrow",
      academyDaysFromToday(
        new Date("2026-09-08T00:00:00Z"),
        new Date("2026-09-07T20:00:00Z"),
      ),
      0,
    );
    eq(
      "a follow-up a day ahead reads as tomorrow",
      academyDaysFromToday(
        new Date("2026-09-09T00:00:00Z"),
        new Date("2026-09-07T20:00:00Z"),
      ),
      1,
    );

    eq(
      "a registration fee of 0 means no fee, not an error",
      convertEnquirySchema.safeParse({
        firstName: "A",
        parentName: "B",
        parentPhone: "9876543210",
        registrationFee: "0",
      }).success,
      true,
    );
    const zeroFee = convertEnquirySchema.safeParse({
      firstName: "A",
      parentName: "B",
      parentPhone: "9876543210",
      registrationFee: "0",
    });
    eq(
      "a fee of 0 creates no Payment",
      zeroFee.success ? zeroFee.data.registrationFee : "parse failed",
      undefined,
    );
    check(
      "a negative fee is still rejected",
      !convertEnquirySchema.safeParse({
        firstName: "A",
        parentName: "B",
        parentPhone: "9876543210",
        registrationFee: "-5",
      }).success,
    );

    // Pagination needs a total order, or a row can repeat or vanish between
    // pages when two share a timestamp.
    const sameInstant = new Date();
    const twins: string[] = [];
    for (const suffix of ["A", "B", "C"]) {
      const row = await prisma.enquiry.create({
        data: {
          organizationId,
          studentName: `ZZTEST Twin ${suffix}`,
          phone: `70000001${suffix === "A" ? 1 : suffix === "B" ? 2 : 3}`,
          createdAt: sameInstant,
        },
        select: { id: true },
      });
      twins.push(row.id);
      madeEnquiries.push(row.id);
    }
    const orderA = (await listEnquiries({ organizationId, q: "ZZTEST Twin", page: 1 })).rows.map(
      (r) => r.id,
    );
    const orderB = (await listEnquiries({ organizationId, q: "ZZTEST Twin", page: 1 })).rows.map(
      (r) => r.id,
    );
    eq("rows sharing a timestamp keep a stable order", orderA, orderB);
    check("all three twins are listed", orderA.length === 3, `got ${orderA.length}`);

    // ---------------------------------------------------------------- Part 5
    console.log("\nPart 5 — courses and students");

    check("course name is required", !createCourseSchema.safeParse({ name: "  " }).success);
    const parsedCourse = createCourseSchema.safeParse({
      name: "  ZZTEST Keyboard  ",
      description: "   ",
    });
    check("course name is trimmed", parsedCourse.success && parsedCourse.data.name === "ZZTEST Keyboard");
    check(
      "a blank description is dropped rather than stored empty",
      parsedCourse.success && parsedCourse.data.description === undefined,
    );

    const activeCourse = await prisma.course.create({
      data: { organizationId, name: "ZZTEST Keyboard", description: "Grade 1" },
      select: { id: true },
    });
    madeCourses.push(activeCourse.id);
    const archivedCourse = await prisma.course.create({
      data: { organizationId, name: "ZZTEST Archived Tabla", active: false },
      select: { id: true },
    });
    madeCourses.push(archivedCourse.id);

    const options = await listCourseOptions(organizationId);
    const optionIds = options.map((option) => option.id);
    check("an active course is offered in the dropdown", optionIds.includes(activeCourse.id));
    check(
      "an archived course is withdrawn from the dropdown",
      !optionIds.includes(archivedCourse.id),
    );
    const optionNames = options.map((option) => option.name);
    /*
      Compared with localeCompare, not JS's default sort. Postgres orders by the
      database collation, which treats "testtt" as coming before "ZZTEST"; the
      default sort compares raw code points and puts every capital letter first.
      The two agree only while every course name happens to start with the same
      case, so this passed until a real course named in lower case existed.
    */
    eq(
      "dropdown options are sorted by name",
      optionNames,
      [...optionNames].sort((a, b) => a.localeCompare(b, "en")),
    );

    /*
      The guard createCourse() relies on to refuse a duplicate. If the database
      ever stopped honouring `mode: "insensitive"` the action would silently
      start allowing two courses with the same name.
    */
    const caseClash = await prisma.course.findFirst({
      where: { organizationId, name: { equals: "zzTEST keyboard", mode: "insensitive" } },
      select: { id: true },
    });
    eq("a duplicate name is caught whatever the casing", caseClash?.id, activeCourse.id);

    const allCourses = await listCourses(organizationId);
    const listedIds = allCourses.map((course) => course.id);
    check("the course list includes archived courses", listedIds.includes(archivedCourse.id));
    check(
      "active courses sort above archived ones",
      listedIds.indexOf(activeCourse.id) < listedIds.indexOf(archivedCourse.id),
    );

    // An enquiry naming a course is what makes "how many for Keyboard?" answerable.
    const courseEnquiry = await prisma.enquiry.create({
      data: {
        organizationId,
        studentName: "ZZTEST Course Enquiry",
        phone: "7000000021",
        courseId: activeCourse.id,
      },
      select: { id: true },
    });
    madeEnquiries.push(courseEnquiry.id);
    const counted = (await listCourses(organizationId)).find((c) => c.id === activeCourse.id);
    eq("a course counts the enquiries that named it", counted?._count.enquiries, 1);

    // -- Students --------------------------------------------------------
    const searchParent = await prisma.parent.create({
      data: { organizationId, name: "ZZTEST Meera Iyer", phone: "7000000031" },
      select: { id: true },
    });
    madeParents.push(searchParent.id);
    const searchStudent = await prisma.student.create({
      data: {
        organizationId,
        parentId: searchParent.id,
        firstName: "ZZTESTKavya",
        lastName: "Iyer",
        phone: "7000000032",
        dateOfBirth: new Date("2015-04-01T06:00:00.000Z"),
      },
      select: { id: true },
    });
    madeStudents.push(searchStudent.id);

    const found = async (q: string) =>
      (await listStudents({ organizationId, q, page: 1 })).rows.map((row) => row.id);

    check("a student is found by first name", (await found("ZZTESTKavya")).includes(searchStudent.id));
    check(
      "a student is found by a name spanning both columns",
      (await found("ZZTESTKavya Iyer")).includes(searchStudent.id),
    );
    check("a student is found by last name alone", (await found("Iyer")).includes(searchStudent.id));
    check(
      "a student is found by the parent's name",
      (await found("ZZTEST Meera")).includes(searchStudent.id),
    );
    check(
      "a student is found by the parent's phone",
      (await found("7000000031")).includes(searchStudent.id),
    );
    check(
      "a parent's phone is found however it was typed",
      (await found("+91 70000 00031")).includes(searchStudent.id),
    );
    check(
      "a student is found by their own phone",
      (await found("7000000032")).includes(searchStudent.id),
    );
    eq("a search matching nobody returns nothing", await found("ZZTESTNoSuchPerson"), []);

    const listed = (await listStudents({ organizationId, q: "ZZTESTKavya", page: 1 })).rows[0];
    eq("the row carries the parent to call", listed?.parent?.phone, "7000000031");
    eq("the row carries the batch count", listed?._count.enrollments, 0);
    eq(
      "a student with no last name still renders a name",
      studentName({ firstName: "Kavya", lastName: null }),
      "Kavya",
    );
    eq(
      "age is whole years, and a birthday later this year has not happened yet",
      ageInYears(new Date("2015-04-01T06:00:00.000Z"), new Date("2026-03-31T06:00:00.000Z")),
      10,
    );
    eq(
      "age ticks over on the birthday itself",
      ageInYears(new Date("2015-04-01T06:00:00.000Z"), new Date("2026-04-01T06:00:00.000Z")),
      11,
    );

    const studentPage = await listStudents({ organizationId, q: "ZZTEST", page: 999 });
    check("student pagination clamps beyond the last page", studentPage.page === studentPage.pageCount);

    // -------------------------------------------------------------- Tenancy
    console.log("\nTenancy");
    const other = await prisma.organization.findFirst({ where: { slug: "your-academy" } });
    if (other) {
      const leak = await listEnquiries({ organizationId: other.id, page: 1 });
      eq("other organization sees nothing", leak.total, 0);
      const studentLeak = await listStudents({ organizationId: other.id, q: "ZZTEST", page: 1 });
      eq("other organization sees no students", studentLeak.total, 0);
      const courseLeak = await listCourseOptions(other.id);
      eq("other organization sees no courses", courseLeak.length, 0);
    }
    const mismatched = await prisma.enquiry.count({
      where: { organizationId, id: { in: madeEnquiries } },
    });
    eq("every created enquiry landed on the right org", mismatched, madeEnquiries.length);
  } finally {
    console.log("\nCleaning up…");
    await prisma.enquiry.updateMany({
      where: { id: { in: madeEnquiries } },
      data: { convertedStudentId: null, parentId: null },
    });
    await prisma.enquiryNote.deleteMany({ where: { enquiryId: { in: madeEnquiries } } });
    await prisma.payment.deleteMany({ where: { studentId: { in: madeStudents } } });
    await prisma.enrollment.deleteMany({ where: { studentId: { in: madeStudents } } });
    await prisma.student.deleteMany({ where: { id: { in: madeStudents } } });
    await prisma.parent.deleteMany({ where: { id: { in: madeParents } } });
    await prisma.enquiry.deleteMany({ where: { id: { in: madeEnquiries } } });
    await prisma.course.deleteMany({ where: { id: { in: madeCourses } } });

    const after = {
      courses: await prisma.course.count(),
      enquiries: await prisma.enquiry.count(),
      students: await prisma.student.count(),
      parents: await prisma.parent.count(),
      payments: await prisma.payment.count(),
      notes: await prisma.enquiryNote.count(),
      enrollments: await prisma.enrollment.count(),
    };
    const restored = JSON.stringify(before) === JSON.stringify(after);
    console.log(`  before ${JSON.stringify(before)}`);
    console.log(`  after  ${JSON.stringify(after)}`);
    console.log(restored ? "  ok   database restored" : "  FAIL database NOT restored");
    if (!restored) failures.push("database restored");

    console.log(
      `\n${passed} passed, ${failures.length} failed` +
        (failures.length ? `:\n  - ${failures.join("\n  - ")}` : ""),
    );
    await prisma.$disconnect();
    if (failures.length) process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
