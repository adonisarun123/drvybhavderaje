/**
 * Creates (or promotes) an administrator account directly from the command line,
 * bypassing the setup-token / invitation flow. Intended for operators only.
 *
 *   npx tsx scripts/create-admin.ts <email> "<name>" "<password>"
 *
 * Uses Better Auth's own createUser so the password hash and account rows match
 * what the login form expects. Existing e-mail → promoted to admin, password unchanged.
 */
import "./load-env";
import { eq } from "drizzle-orm";
import { auth } from "../lib/auth";
import { db, getPool } from "../lib/db/client";
import { user as userTable } from "../lib/db/schema";
import { recordAudit } from "../lib/audit";

const OPERATOR = { id: null, label: "operator cli" };

async function main() {
  const [rawEmail, name, password] = process.argv.slice(2);
  if (!rawEmail || !name || !password) {
    console.error('Usage: npx tsx scripts/create-admin.ts <email> "<name>" "<password>"');
    process.exit(2);
  }
  const email = rawEmail.trim().toLowerCase();

  const [existing] = await db.select().from(userTable).where(eq(userTable.email, email));
  if (existing) {
    if (existing.role === "admin") {
      console.log(`Already an admin: ${email} (${existing.id}) — nothing changed.`);
    } else {
      await db.update(userTable).set({ role: "admin" }).where(eq(userTable.id, existing.id));
      await recordAudit(db, { actor: OPERATOR, action: "user.role", entityType: "user", entityId: existing.id, summary: `Promoted ${email} to admin via CLI`, changes: { role: { from: existing.role, to: "admin" } } });
      console.log(`Promoted to admin: ${email} (${existing.id}). Password unchanged.`);
    }
    return;
  }

  const created = await auth.api.createUser({ body: { email, password, name, role: "admin" } });
  await recordAudit(db, { actor: OPERATOR, action: "user.create", entityType: "user", entityId: created.user.id, summary: `Administrator ${email} created via CLI` });
  console.log(`Admin created: ${email} (${created.user.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await getPool().end().catch(() => undefined);
  });
