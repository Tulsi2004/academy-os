import { prisma } from "@/lib/prisma";

const ORG_SLUG = process.env.ORG_SLUG;

export async function getCurrentOrganization() {
  if (!ORG_SLUG) {
    throw new Error(
      "ORG_SLUG is not set. This database may be shared with other projects, so every " +
        "query is scoped to one Organization — set ORG_SLUG in .env to a slug unique across " +
        "everything sharing the database.",
    );
  }

  return prisma.organization.upsert({
    where: { slug: ORG_SLUG },
    update: {},
    create: {
      slug: ORG_SLUG,
      name: process.env.ORG_NAME || "Your Academy",
    },
  });
}
