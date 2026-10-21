import "server-only";
import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { auth } from "../auth";
import { db } from "../db/client";
import { invitations, user as userTable, userPermissions, PERMISSIONS, type Permission } from "../db/schema";
import { AppError, NotFoundError, ValidationError } from "../errors";
import { recordAudit, type Actor } from "../audit";
import { generateToken, hashToken } from "../security/tokens";
import type { Role } from "../auth/guard";

export const INVITE_TTL_HOURS = 72;

export async function countUsers(): Promise<number> {
  const [row] = await db.select({ n: sql<number>`count(*)::int` }).from(userTable);
  return row?.n ?? 0;
}

export async function listStaff() {
  const users = await db.select().from(userTable).orderBy(desc(userTable.createdAt));
  const grants = await db.select().from(userPermissions);
  return users.map((u) => ({
    ...u,
    permissions: grants.filter((g) => g.userId === u.id).map((g) => g.permission as Permission),
  }));
}

export async function listInvitations() {
  return db.select().from(invitations).where(and(isNull(invitations.acceptedAt), isNull(invitations.revokedAt))).orderBy(desc(invitations.createdAt));
}

/** Creates the very first administrator. Only valid while no users exist and the setup token matches. */
export async function createFirstAdmin(input: { name: string; email: string; password: string }, actor: Actor) {
  if ((await countUsers()) > 0) throw new AppError("setup_done", "Setup has already been completed.", 409);
  const created = await auth.api.createUser({ body: { email: input.email, password: input.password, name: input.name, role: "admin" } });
  await recordAudit(db, { actor: { id: created.user.id, label: `${input.name} <${input.email}>` }, action: "user.setup", entityType: "user", entityId: created.user.id, summary: `First administrator created via setup token` });
  return created.user;
}

export async function createInvitation(input: { email: string; name: string; role: Role; permissions: Permission[] }, actor: Actor): Promise<{ token: string; id: string; expiresAt: Date }> {
  const email = input.email.trim().toLowerCase();
  const [existing] = await db.select().from(userTable).where(eq(userTable.email, email));
  if (existing) throw new ValidationError("A staff account with this email already exists.", { email: ["Already registered"] });
  for (const p of input.permissions) if (!PERMISSIONS.includes(p)) throw new ValidationError("Unknown permission");
  const token = generateToken();
  const expiresAt = new Date(Date.now() + INVITE_TTL_HOURS * 3_600_000);
  // Revoke any earlier open invitation for the same email.
  await db.update(invitations).set({ revokedAt: new Date() }).where(and(eq(invitations.email, email), isNull(invitations.acceptedAt), isNull(invitations.revokedAt)));
  const [inv] = await db
    .insert(invitations)
    .values({ email, name: input.name.trim(), role: input.role, permissions: input.role === "admin" ? [] : input.permissions, tokenHash: hashToken(token), invitedBy: actor.id, expiresAt })
    .returning();
  await recordAudit(db, { actor, action: "user.invite", entityType: "invitation", entityId: inv!.id, summary: `Invited ${email} as ${input.role}`, changes: { role: input.role, permissions: input.permissions } });
  return { token, id: inv!.id, expiresAt };
}

export async function revokeInvitation(id: string, actor: Actor) {
  const [inv] = await db.update(invitations).set({ revokedAt: new Date() }).where(and(eq(invitations.id, id), isNull(invitations.acceptedAt))).returning();
  if (!inv) throw new NotFoundError("Invitation not found");
  await recordAudit(db, { actor, action: "user.invite.revoke", entityType: "invitation", entityId: id, summary: `Revoked invitation for ${inv.email}` });
}

export async function findOpenInvitation(token: string) {
  const [inv] = await db.select().from(invitations).where(eq(invitations.tokenHash, hashToken(token)));
  if (!inv || inv.acceptedAt || inv.revokedAt || inv.expiresAt < new Date()) return null;
  return inv;
}

export async function acceptInvitation(token: string, input: { name: string; password: string }) {
  const inv = await findOpenInvitation(token);
  if (!inv) throw new AppError("invalid_invitation", "This invitation link is invalid, expired or already used. Ask an administrator for a new one.", 410);
  const created = await auth.api.createUser({ body: { email: inv.email, password: input.password, name: input.name.trim() || inv.name, role: inv.role as Role } });
  if (inv.permissions.length) {
    await db.insert(userPermissions).values(inv.permissions.map((p) => ({ userId: created.user.id, permission: p, grantedBy: inv.invitedBy })));
  }
  await db.update(invitations).set({ acceptedAt: new Date(), acceptedUserId: created.user.id }).where(eq(invitations.id, inv.id));
  await recordAudit(db, { actor: { id: created.user.id, label: `${input.name} <${inv.email}>` }, action: "user.invite.accept", entityType: "user", entityId: created.user.id, summary: `Accepted invitation (${inv.role})` });
  return created.user;
}

export async function setUserRole(userId: string, role: Role, actor: Actor) {
  if (userId === actor.id) throw new AppError("self_change", "You cannot change your own role.");
  const [target] = await db.select().from(userTable).where(eq(userTable.id, userId));
  if (!target) throw new NotFoundError("User not found");
  await db.update(userTable).set({ role, updatedAt: new Date() }).where(eq(userTable.id, userId));
  await auth.api.revokeUserSessions({ body: { userId } }); // role changes take effect immediately
  await recordAudit(db, { actor, action: "user.role", entityType: "user", entityId: userId, summary: `Role changed to ${role}`, changes: { role: { from: target.role, to: role } } });
}

export async function setUserPermissions(userId: string, perms: Permission[], actor: Actor) {
  for (const p of perms) if (!PERMISSIONS.includes(p)) throw new ValidationError("Unknown permission");
  await db.transaction(async (tx) => {
    await tx.delete(userPermissions).where(eq(userPermissions.userId, userId));
    if (perms.length) await tx.insert(userPermissions).values(perms.map((p) => ({ userId, permission: p, grantedBy: actor.id })));
    await recordAudit(tx, { actor, action: "user.permissions", entityType: "user", entityId: userId, summary: `Permissions set: ${perms.join(", ") || "none"}`, changes: { permissions: perms } });
  });
}

export async function deactivateUser(userId: string, reason: string, actor: Actor) {
  if (userId === actor.id) throw new AppError("self_change", "You cannot deactivate your own account.");
  const admins = await db.select({ id: userTable.id }).from(userTable).where(and(eq(userTable.role, "admin"), eq(userTable.banned, false)));
  const [target] = await db.select().from(userTable).where(eq(userTable.id, userId));
  if (!target) throw new NotFoundError("User not found");
  if (target.role === "admin" && admins.length <= 1) throw new AppError("last_admin", "You cannot deactivate the only active administrator.");
  await auth.api.banUser({ body: { userId, banReason: reason || "Deactivated by administrator" } });
  await auth.api.revokeUserSessions({ body: { userId } });
  await recordAudit(db, { actor, action: "user.deactivate", entityType: "user", entityId: userId, summary: `Deactivated ${target.email}: ${reason}` });
}

export async function reactivateUser(userId: string, actor: Actor) {
  await auth.api.unbanUser({ body: { userId } });
  await recordAudit(db, { actor, action: "user.reactivate", entityType: "user", entityId: userId, summary: `Reactivated account` });
}

export async function adminResetPassword(userId: string, newPassword: string, actor: Actor) {
  await auth.api.setUserPassword({ body: { userId, newPassword } });
  await auth.api.revokeUserSessions({ body: { userId } });
  await recordAudit(db, { actor, action: "user.password_reset", entityType: "user", entityId: userId, summary: `Password reset by administrator; sessions revoked` });
}
