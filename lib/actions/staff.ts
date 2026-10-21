"use server";

import { z } from "zod";
import { actorOf, requireAdmin } from "@/lib/auth/guard";
import { PERMISSIONS, type Permission } from "@/lib/db/schema";
import { adminResetPassword, createInvitation, deactivateUser, reactivateUser, revokeInvitation, setUserPermissions, setUserRole } from "@/lib/staff/service";
import { siteOrigin } from "@/lib/seo";
import { formToObject, parseOrThrow, run } from "./util";

const inviteSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  name: z.string().trim().min(2).max(80),
  role: z.enum(["admin", "coordinator"]),
  permissions: z.union([z.string(), z.array(z.string())]).optional(),
});

function permsFrom(v: string | string[] | undefined): Permission[] {
  const arr = Array.isArray(v) ? v : v ? [v] : [];
  return arr.filter((p): p is Permission => (PERMISSIONS as readonly string[]).includes(p));
}

export async function inviteStaffAction(formData: FormData) {
  return run(async () => {
    const user = await requireAdmin();
    const input = parseOrThrow(inviteSchema, formToObject(formData));
    const inv = await createInvitation({ ...input, permissions: permsFrom(input.permissions) }, actorOf(user));
    return { link: `${siteOrigin()}/admin/invite/${inv.token}`, expiresAt: inv.expiresAt.toISOString() };
  });
}

export async function revokeInvitationAction(id: string) {
  return run(async () => {
    const user = await requireAdmin();
    await revokeInvitation(id, actorOf(user));
    return undefined;
  });
}

export async function setRoleAction(userId: string, role: "admin" | "coordinator") {
  return run(async () => {
    const user = await requireAdmin();
    await setUserRole(userId, role, actorOf(user));
    return undefined;
  });
}

export async function setPermissionsAction(userId: string, formData: FormData) {
  return run(async () => {
    const user = await requireAdmin();
    const raw = formToObject(formData).permissions;
    await setUserPermissions(userId, permsFrom(raw as string | string[] | undefined), actorOf(user));
    return undefined;
  });
}

export async function deactivateUserAction(userId: string, reason: string) {
  return run(async () => {
    const user = await requireAdmin();
    await deactivateUser(userId, reason, actorOf(user));
    return undefined;
  });
}

export async function reactivateUserAction(userId: string) {
  return run(async () => {
    const user = await requireAdmin();
    await reactivateUser(userId, actorOf(user));
    return undefined;
  });
}

export async function resetPasswordAction(userId: string, newPassword: string) {
  return run(async () => {
    const user = await requireAdmin();
    parseOrThrow(z.string().min(10).max(128), newPassword);
    await adminResetPassword(userId, newPassword, actorOf(user));
    return undefined;
  });
}
