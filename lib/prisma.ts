import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL!,
      // We connect through Supabase's pooler, which drops idle connections.
      // Without TCP keep-alive the socket can go half-open and the pool hands
      // out a dead client, so the first query after an idle spell fails.
      keepAlive: true,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
      max: 10,
    }),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
