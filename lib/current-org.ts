import { cache } from "react";
import { prisma } from "@/lib/prisma";

const ORG_SLUG = process.env.ORG_SLUG;

// `cache` dedupes this across a single request: the (main) layout, the page it
// renders, and any server action all share one lookup instead of re-querying.
export const getCurrentOrganization = cache(async function getCurrentOrganization() {
  if (!ORG_SLUG) {
    throw new Error(
      "ORG_SLUG is not set. This database may be shared with other projects, so every " +
        "query is scoped to one Organization — set ORG_SLUG in .env to a slug unique across " +
        "everything sharing the database.",
    );
  }

  // Read first. This used to `upsert`, which meant every authenticated page
  // render issued a write; a single flaky write then took down the whole
  // layout. The row is created once, on first boot, and read from then on.
  const existing = await prisma.organization.findUnique({
    where: { slug: ORG_SLUG },
  });
  if (existing) return existing;

  try {
    return await prisma.organization.create({
      data: {
        slug: ORG_SLUG,
        name: process.env.ORG_NAME || "Your Academy",
      },
    });
  } catch {
    // Two concurrent first-boot requests race here; the loser re-reads the
    // row the winner just created rather than surfacing a unique violation.
    const created = await prisma.organization.findUnique({
      where: { slug: ORG_SLUG },
    });
    if (created) return created;
    throw new Error(`Could not find or create the Organization with slug "${ORG_SLUG}".`);
  }
});
