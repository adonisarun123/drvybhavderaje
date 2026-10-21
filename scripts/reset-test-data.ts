/**
 * Removes everything the automated test suites create and returns the scheduling
 * configuration to "not configured": no working hours, public slots off.
 * Only touches obviously synthetic records (names starting "E2E ", @example.test
 * accounts, test-suite audit rows). Run after `npm run test:e2e` against a shared database.
 *
 * Prefer running the e2e suite against a Neon branch instead (see docs/SETUP.md).
 */
import "./load-env";
import { eq, ilike, inArray, like, or, sql } from "drizzle-orm";
import { db, getPool } from "../lib/db/client";
import { account, appointments, auditEvents, blocks, enquiries, holds, invitations, occupancy, schedulingSettings, session, user, userPermissions, weeklySessions, dateOverrides, recurringBlocks, enquiryNotes } from "../lib/db/schema";

async function main() {
  const appts = await db.select({ id: appointments.id }).from(appointments).where(like(appointments.patientName, "E2E %"));
  const apptIds = appts.map((a) => a.id);
  if (apptIds.length) {
    await db.delete(occupancy).where(inArray(occupancy.appointmentId, apptIds));
    await db.delete(holds).where(inArray(holds.appointmentId, apptIds));
    await db.delete(appointments).where(inArray(appointments.id, apptIds));
  }
  const enqs = await db.select({ id: enquiries.id }).from(enquiries).where(like(enquiries.name, "E2E %"));
  const enqIds = enqs.map((e) => e.id);
  if (enqIds.length) {
    await db.delete(enquiryNotes).where(inArray(enquiryNotes.enquiryId, enqIds));
    await db.delete(holds).where(inArray(holds.enquiryId, enqIds));
    await db.delete(enquiries).where(inArray(enquiries.id, enqIds));
  }
  const blks = await db.select({ id: blocks.id }).from(blocks).where(like(blocks.reason, "E2E %"));
  if (blks.length) {
    await db.delete(occupancy).where(inArray(occupancy.blockId, blks.map((b) => b.id)));
    await db.delete(blocks).where(inArray(blocks.id, blks.map((b) => b.id)));
  }
  await db.delete(recurringBlocks).where(like(recurringBlocks.reason, "E2E %"));
  // Working hours configured by the test suite are invented timings: remove ALL weekly sessions
  // and overrides, and switch public slots off, so nothing invented is published.
  await db.delete(weeklySessions);
  await db.delete(dateOverrides);
  await db.update(schedulingSettings).set({ publicSlotsEnabled: false, minNoticeHours: 24, maxHorizonDays: 60 });
  // Test staff accounts
  const users = await db.select({ id: user.id }).from(user).where(or(ilike(user.email, "%@example.test"), ilike(user.email, "e2e-%"))!);
  const userIds = users.map((u) => u.id);
  if (userIds.length) {
    await db.delete(session).where(inArray(session.userId, userIds));
    await db.delete(account).where(inArray(account.userId, userIds));
    await db.delete(userPermissions).where(inArray(userPermissions.userId, userIds));
    await db.delete(invitations).where(ilike(invitations.email, "%@example.test"));
    await db.delete(user).where(inArray(user.id, userIds));
  }
  await db.delete(auditEvents).where(or(eq(auditEvents.actorLabel, "test-suite"), ilike(auditEvents.actorLabel, "%@example.test%"), ilike(auditEvents.summary, "%E2E %"), eq(auditEvents.actorLabel, "setup"))!);
  await db.delete(auditEvents).where(sql`${auditEvents.entityType} = 'weekly_session' OR ${auditEvents.entityType} = 'scheduling_settings' OR ${auditEvents.entityType} = 'date_override'`);
  const [remaining] = await db.select({ n: sql<number>`count(*)::int` }).from(user);
  console.log(`Reset complete. Appointments removed: ${apptIds.length}, enquiries: ${enqIds.length}, blocks: ${blks.length}, staff accounts: ${userIds.length}. Remaining staff accounts: ${remaining?.n ?? 0}.`);
  await getPool().end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
