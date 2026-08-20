import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import type { UserRole } from "@/generated/prisma/enums";

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await prisma.session.create({
    data: { userId, tokenHash: hashToken(token), expiresAt },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

const SAFE_USER_SELECT = {
  id: true,
  organizationId: true,
  name: true,
  email: true,
  role: true,
  active: true,
} as const;

export type SessionUser = {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
};

// Selects only the non-sensitive columns — the returned value is passed as a
// prop into Client Components, so `passwordHash` must never be loaded here.
export const verifySession = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    select: { expiresAt: true, user: { select: SAFE_USER_SELECT } },
  });

  if (!session || session.expiresAt < new Date() || !session.user.active) {
    return null;
  }

  return session.user;
});

export async function getCurrentUser() {
  return verifySession();
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(roles: UserRole[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/");
  return user;
}

export async function deleteSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  }

  cookieStore.delete(SESSION_COOKIE);
}
