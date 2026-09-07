import { config as loadEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

loadEnv({ path: [".env.local", ".env"], quiet: true });

/*
  Answers "did that land on the right academy?" without opening a SQL client.
  Read-only. Run with `npm run check:tenancy`.
*/
async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set — check .env.local");

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  try {
    const organizations = await prisma.organization.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { users: true, enquiries: true } },
      },
    });

    for (const org of organizations) {
      console.log(`\n${org.name}  (slug: ${org.slug})`);
      console.log(`  id: ${org.id}`);
      console.log(`  ${org._count.users} user(s), ${org._count.enquiries} enquiry(ies)`);

      const enquiries = await prisma.enquiry.findMany({
        where: { organizationId: org.id },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: { studentName: true, phone: true, status: true, followUpDate: true },
      });
      for (const e of enquiries) {
        const followUp = e.followUpDate ? e.followUpDate.toISOString().slice(0, 10) : "—";
        console.log(
          `    ${e.studentName.padEnd(16)} ${e.phone.padEnd(12)} ${e.status.padEnd(10)} follow-up ${followUp}`,
        );
      }
      if (org._count.enquiries > enquiries.length) {
        console.log(`    … ${org._count.enquiries - enquiries.length} more`);
      }
    }

    const orphans = await prisma.enquiry.count({
      where: { organizationId: { notIn: organizations.map((o) => o.id) } },
    });
    console.log(
      `\nEnquiries not belonging to any listed organization: ${orphans} (must be 0)`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
