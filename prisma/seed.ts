import { config as loadEnv } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

// `prisma db seed` loads env through prisma.config.ts, but this file is also
// runnable directly with `tsx prisma/seed.ts`. Import statements are hoisted,
// so nothing above may read process.env at module scope — the client is built
// inside main() for that reason.
loadEnv({ path: [".env.local", ".env"], quiet: true });

/*
  Onboarding is deliberately manual. There is no self-serve signup and there
  should not be one yet: an academy is set up by us, once, and its staff are
  added by its owner. To onboard a new academy, edit the constants below and
  run `npx prisma db seed`.

  The seed is idempotent — re-running it renames/repairs rather than
  duplicating, and it never overwrites a `clerkUserId` that a real sign-in has
  already filled in.
*/

const ORGANIZATION = {
  slug: "the-tulsi-academy",
  name: "The Tulsi Academy",
};

// The very first deployment created this organization under the app's own name,
// before the academy had one. Adopt that row instead of stranding its users
// alongside a second organization. Safe to delete once no database has it.
const LEGACY_ORGANIZATION_SLUG = "academy-os";

const OWNER = {
  name: "Tulsi",
  email: "tulsimani04@gmail.com",
};

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set — check .env.local");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  try {
    const legacy = await prisma.organization.findUnique({
      where: { slug: LEGACY_ORGANIZATION_SLUG },
    });
    if (legacy && legacy.slug !== ORGANIZATION.slug) {
      await prisma.organization.update({
        where: { id: legacy.id },
        data: ORGANIZATION,
      });
      console.log(`Adopted existing organization "${legacy.slug}" as "${ORGANIZATION.slug}".`);
    }

    const organization = await prisma.organization.upsert({
      where: { slug: ORGANIZATION.slug },
      update: { name: ORGANIZATION.name },
      create: ORGANIZATION,
    });

    // `clerkUserId` is intentionally absent from both branches. It is null until
    // this person signs in for the first time, and filled by getOrgContext()
    // then — re-seeding must not undo that link.
    const owner = await prisma.user.upsert({
      where: {
        organizationId_email: { organizationId: organization.id, email: OWNER.email },
      },
      update: { name: OWNER.name, role: "OWNER", active: true },
      create: {
        organizationId: organization.id,
        name: OWNER.name,
        email: OWNER.email,
        role: "OWNER",
      },
    });

    console.log(`Organization: ${organization.name} (${organization.slug})`);
    console.log(
      `Owner: ${owner.name} <${owner.email}> — ${
        owner.clerkUserId ? "linked to Clerk" : "not signed in yet"
      }`,
    );

    const strays = await prisma.organization.findMany({
      where: { id: { not: organization.id } },
      select: { slug: true, _count: { select: { users: true } } },
    });
    for (const stray of strays) {
      console.warn(
        `Warning: another organization exists — "${stray.slug}" with ${stray._count.users} user(s). ` +
          `Nothing resolves to it; delete it by hand if it is leftover.`,
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
