import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { auth } from "./index";
import { db } from "../db/client";
import { userPermissions, type Permission } from "../db/schema";
import { ForbiddenError, UnauthorizedError } from "../errors";
import type { Actor } from "../audit";

export type Role = "admin" | "coordinator";

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  permissions: Permission[];
  sessionExpiresAt: Date;
}

/** Resolve the signed-in staff member (or null). Cached per request. */
export const getStaffUser = cache(async (): Promise<StaffUser | null> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const u = session.user as typeof session.user & { role?: string; banned?: boolean | null };
  if (u.banned) return null;
  const role: Role = u.role === "admin" ? "admin" : "coordinator";
  const grants = await db.select({ p: userPermissions.permission }).from(userPermissions).where(eq(userPermissions.userId, u.id));
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role,
    permissions: grants.map((g) => g.p as Permission),
    sessionExpiresAt: new Date(session.session.expiresAt),
  };
});

export function can(user: StaffUser, permission: Permission | "users:manage"): boolean {
  if (user.role === "admin") return true;
  if (permission === "users:manage") return false;
  return user.permissions.includes(permission);
}

/** Every server action and API route handling private data calls one of these. */
export async function requireStaff(): Promise<StaffUser> {
  const user = await getStaffUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

export async function requireAdmin(): Promise<StaffUser> {
  const user = await requireStaff();
  if (user.role !== "admin") throw new ForbiddenError("Administrator access required.");
  return user;
}

export async function requirePermission(permission: Permission | "users:manage"): Promise<StaffUser> {
  const user = await requireStaff();
  if (!can(user, permission)) throw new ForbiddenError("You do not have permission for this action. Ask an administrator to grant it.");
  return user;
}

export function actorOf(user: StaffUser): Actor {
  return { id: user.id, label: `${user.name} <${user.email}>` };
}
