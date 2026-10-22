/**
 * End-to-end workflows against a running server (default http://localhost:3000)
 * connected to the real database. Run: npx playwright test
 *
 * Creates its own staff accounts (admin + coordinator), working hours and
 * appointments. Patient names are obviously synthetic ("E2E …").
 */
import { test, expect, type Page, type Browser } from "@playwright/test";
import { DateTime } from "luxon";

const BASE = process.env.E2E_BASE_URL ?? "http://localhost:3000";
const SETUP_TOKEN = process.env.ADMIN_SETUP_TOKEN ?? "dev-setup-token-change-me";
const ADMIN = { name: "E2E Admin", email: "e2e-admin@example.test", password: "e2e-admin-password-1" };
const COORD = { name: "E2E Coordinator", email: `e2e-coord-${Date.now()}@example.test`, password: "e2e-coord-password-1" };
const run = Date.now().toString(36);

// A Monday at least 3 days out, in IST, shifted by a per-run number of weeks so repeated
// runs against the same database do not collide with earlier test bookings.
const weekOffset = Math.floor(Date.now() / 60_000) % 40;
const nextMonday = (() => {
  let d = DateTime.now().setZone("Asia/Kolkata").plus({ days: 3 }).startOf("day");
  while (d.weekday !== 1) d = d.plus({ days: 1 });
  return d.plus({ weeks: weekOffset });
})();
const dayAfter = nextMonday.plus({ days: 1 }); // Tuesday
const freeThursday = nextMonday.plus({ days: 3 });
const local = (dt: DateTime, hhmm: string) => `${dt.toISODate()}T${hhmm}`;

// Sign in once per account and reuse the session cookies: sign-in is rate-limited per IP
// (10 attempts / 5 minutes), which a test suite would otherwise trip on its own.
const sessionCookies = new Map<string, Awaited<ReturnType<ReturnType<Page["context"]>["cookies"]>>>();

async function login(page: Page, who = ADMIN) {
  const cached = sessionCookies.get(who.email);
  if (cached) {
    await page.context().addCookies(cached);
    await page.goto(`${BASE}/admin`);
    if (page.url().endsWith("/admin")) return;
    sessionCookies.delete(who.email);
  }
  await page.goto(`${BASE}/admin/login`);
  if (page.url().includes("/admin/setup")) {
    await page.fill('input[name="token"]', SETUP_TOKEN);
    await page.fill('input[name="name"]', ADMIN.name);
    await page.fill('input[name="email"]', ADMIN.email);
    await page.fill('input[name="password"]', ADMIN.password);
    await page.click('.auth-card button[type="submit"]');
    await page.waitForURL(/\/admin$/);
    sessionCookies.set(who.email, await page.context().cookies());
    return;
  }
  if (page.url().endsWith("/admin")) return; // already signed in
  await page.fill('input[name="email"]', who.email);
  await page.fill('input[name="password"]', who.password);
  await page.click('.auth-card button[type="submit"]');
  await page.waitForURL(/\/admin(\?|$)/);
  sessionCookies.set(who.email, await page.context().cookies());
}

test.describe.configure({ mode: "serial" });

test("anonymous users are redirected and the API refuses them", async ({ page, request }) => {
  await page.goto(`${BASE}/admin/enquiries`);
  await expect(page).toHaveURL(/\/admin\/(login|setup)/);
  const res = await request.get(`${BASE}/api/admin/calendar?start=2026-01-01T00:00:00Z&end=2026-01-08T00:00:00Z`);
  expect(res.status()).toBe(401);
  const robots = await request.get(`${BASE}/robots.txt`);
  expect(await robots.text()).toContain("Disallow");
});

test("first administrator setup / sign in works and session shows IST expiry", async ({ page }) => {
  await login(page);
  await expect(page.locator(".admin-side")).toContainText("Session ends");
  await expect(page.locator(".admin-side")).toContainText("IST");
  // Setup page is closed once a user exists
  await page.goto(`${BASE}/admin/setup`);
  await expect(page).not.toHaveURL(/setup/);
});

test("administrator configures working hours (Mon–Fri Whitefield morning, Koramangala evening)", async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/admin/availability`);
  const existing = await page.locator("#weekly table tbody tr").count();
  if (existing === 0) {
    for (const wd of [1, 2, 3, 4, 5]) {
      const form = page.locator("#weekly form");
      await form.locator('select[name="weekday"]').selectOption(String(wd));
      await form.locator('select[name="clinicId"]').selectOption({ label: "Whitefield" });
      await form.locator('input[name="startTime"]').fill("10:00");
      await form.locator('input[name="endTime"]').fill("13:00");
      await form.locator('button[type="submit"]').click();
      await expect(page.locator("#weekly table tbody tr")).toHaveCount((wd - 1) * 2 + 1, { timeout: 15000 });
      await form.locator('select[name="weekday"]').selectOption(String(wd));
      await form.locator('select[name="clinicId"]').selectOption({ label: "Koramangala" });
      await form.locator('input[name="startTime"]').fill("16:00");
      await form.locator('input[name="endTime"]').fill("19:00");
      await form.locator('button[type="submit"]').click();
      await expect(page.locator("#weekly table tbody tr")).toHaveCount(wd * 2, { timeout: 15000 });
    }
  }
  await expect(page.locator("#weekly table")).toContainText("Monday");
  await expect(page.locator("#weekly table")).toContainText("10:00 AM – 1:00 PM");
  // Enable published slots so the public form shows times
  const settings = page.locator("#settings form");
  await settings.locator('input[name="publicSlotsEnabled"]').check();
  await settings.locator('input[name="minNoticeHours"]').fill("0");
  await settings.locator('input[name="maxHorizonDays"]').fill("365");
  await settings.locator('button[type="submit"]').click();
  await expect(page.locator("#settings")).toContainText("Settings saved", { timeout: 15000 });
});

let enquiryRef = "";
test("public enquiry reaches the admin list", async ({ page }) => {
  await page.context().clearCookies();
  await page.goto(`${BASE}/contact-us.html`);
  await page.fill('input[name="name"]', `E2E Patient ${run}`);
  await page.fill('input[name="phone"]', "98765 43210");
  await page.selectOption('select[name="clinic"]', "whitefield");
  // published availability: pick next Monday and the first slot
  await page.fill('input[type="date"]', nextMonday.toISODate()!);
  await expect(page.locator(".slot-grid label").first()).toBeVisible({ timeout: 15000 });
  await page.locator(".slot-grid label").first().click();
  await page.check('input[name="consent"]');
  await page.waitForTimeout(2600); // bot-timing threshold
  await page.click('main button[type="submit"]');
  const status = page.locator('[role="status"]');
  await expect(status).toContainText("received", { timeout: 15000 });
  await expect(status).toContainText("not");
  enquiryRef = (await status.locator("strong").nth(1).textContent())?.trim() ?? "";
  expect(enquiryRef).toMatch(/^ENQ-/);

  await login(page);
  await page.goto(`${BASE}/admin/enquiries?q=${enquiryRef}`);
  await expect(page.locator("table")).toContainText(enquiryRef);
  await expect(page.locator("table")).toContainText("+91 98765 43210");
  await expect(page.locator("table")).toContainText("new");
});

let convertedApptUrl = "";
test("staff converts the enquiry into a confirmed appointment (and repeated submit is idempotent)", async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/admin/enquiries?q=${enquiryRef}`);
  await page.click(`a:has-text("${enquiryRef}")`);
  const form = page.locator("form").filter({ has: page.locator('input[name="idempotencyKey"]') });
  await form.locator('input[name="startAt"]').fill(local(nextMonday, "10:00"));
  await form.locator('input[name="durationMin"]').fill("30");
  await form.locator('select[name="status"]').selectOption("confirmed");
  await form.locator('button[type="submit"]').click();
  await page.waitForURL(/\/admin\/appointments\/[0-9a-f-]+\?created=1/, { timeout: 20000 });
  convertedApptUrl = page.url().split("?")[0]!;
  await expect(page.locator("h1")).toContainText("E2E Patient");
  await expect(page.locator(".page-head")).toContainText("confirmed");
  await expect(page.locator(".page-head")).toContainText("IST");
  // enquiry now shows converted + link
  await page.goto(`${BASE}/admin/enquiries?status=all&q=${enquiryRef}`);
  await expect(page.locator("table")).toContainText("converted");
});

test("confirmed time blocks a second booking; cross-clinic travel buffer is enforced", async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/admin/appointments/new`);
  const form = page.locator("main form");
  await form.locator('input[name="patientName"]').fill(`E2E Clash ${run}`);
  await form.locator('input[name="phone"]').fill("9000000001");
  await form.locator('select[name="clinicId"]').selectOption({ label: "Whitefield" });
  await form.locator('input[name="startAt"]').fill(local(nextMonday, "10:15"));
  await form.locator('input[name="durationMin"]').fill("30");
  await form.locator('button[type="submit"]').click();
  await expect(page.locator('[role="alert"]:not([id])')).toContainText("not available", { timeout: 20000 });
  await expect(page.locator('[role="alert"]:not([id])')).toContainText("E2E Patient");
  // different clinic, 13:30 is within the 60-minute travel buffer of a 10:00–10:30 WF appointment? No — 3h away. Use 11:00 at KM (outside KM hours → needs ack) so pick an overlapping-by-buffer case instead:
  await form.locator('select[name="clinicId"]').selectOption({ label: "Koramangala" });
  await form.locator('input[name="startAt"]').fill(local(nextMonday, "10:45"));
  await form.locator('button[type="submit"]').click();
  await expect(page.locator('[role="alert"]:not([id])')).toContainText("travel buffer", { timeout: 20000 });
});

test("phone appointment: create, reschedule atomically, cancel releases the time", async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/admin/appointments/new`);
  const form = page.locator("main form");
  await form.locator('input[name="patientName"]').fill(`E2E Phone ${run}`);
  await form.locator('input[name="phone"]').fill("9000000002");
  await form.locator('select[name="clinicId"]').selectOption({ label: "Whitefield" });
  await form.locator('input[name="startAt"]').fill(local(dayAfter, "11:00"));
  await form.locator('input[name="durationMin"]').fill("30");
  await form.locator('select[name="status"]').selectOption("confirmed");
  await form.locator('button[type="submit"]').click();
  await page.waitForURL(/\/admin\/appointments\/[0-9a-f-]+\?created=1/, { timeout: 20000 });
  const url = page.url().split("?")[0]!;

  // Reschedule onto the converted appointment's slot must fail and leave it unchanged
  await page.click('button:has-text("Reschedule")');
  await page.fill('input[name="startAt"]', local(nextMonday, "10:00"));
  await page.click('button:has-text("Save new time")');
  await expect(page.locator('[role="alert"]:not([id])')).toContainText("not available", { timeout: 20000 });
  await page.reload();
  await expect(page.locator(".page-head")).toContainText("11:00 AM");

  // Reschedule to a free time succeeds
  await page.click('button:has-text("Reschedule")');
  await page.fill('input[name="startAt"]', local(dayAfter, "12:00"));
  await page.click('button:has-text("Save new time")');
  await expect(page.locator(".page-head")).toContainText("12:00 PM", { timeout: 20000 });
  await expect(page.locator(".card", { hasText: "History" })).toContainText("Rescheduled");

  // Old slot is free again: a new confirmed booking at 11:00 works
  await page.goto(`${BASE}/admin/appointments/new`);
  await page.fill('input[name="patientName"]', `E2E Refill ${run}`);
  await page.fill('input[name="phone"]', "9000000003");
  await page.selectOption('select[name="clinicId"]', { label: "Whitefield" });
  await page.fill('input[name="startAt"]', local(dayAfter, "11:00"));
  await page.click('main button[type="submit"]');
  await page.waitForURL(/created=1/, { timeout: 20000 });

  // Cancel releases 12:00
  await page.goto(url);
  await page.click('button:has-text("Cancel appointment")');
  await page.fill('input[name="reason"]', "E2E cancellation");
  await page.click('button:has-text("Confirm cancellation")');
  await expect(page.locator(".page-head")).toContainText("cancelled", { timeout: 20000 });
  await page.goto(`${BASE}/admin/appointments/new`);
  await page.fill('input[name="patientName"]', `E2E AfterCancel ${run}`);
  await page.fill('input[name="phone"]', "9000000004");
  await page.selectOption('select[name="clinicId"]', { label: "Whitefield" });
  await page.fill('input[name="startAt"]', local(dayAfter, "12:00"));
  await page.click('main button[type="submit"]');
  await page.waitForURL(/created=1/, { timeout: 20000 });
});

test("requested appointment does not block until confirmed; confirmation blocks", async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/admin/appointments/new`);
  await page.fill('input[name="patientName"]', `E2E Request ${run}`);
  await page.fill('input[name="phone"]', "9000000005");
  await page.selectOption('select[name="clinicId"]', { label: "Whitefield" });
  await page.fill('input[name="startAt"]', local(dayAfter, "10:00"));
  await page.selectOption('select[name="status"]', "requested");
  await page.fill('input[name="holdMinutes"]', "0");
  await page.click('main button[type="submit"]');
  await page.waitForURL(/created=1/, { timeout: 20000 });
  await page.click('button:has-text("Confirm appointment")');
  await expect(page.locator(".page-head")).toContainText("confirmed", { timeout: 20000 });
  // Now a second one at the same time cannot be confirmed
  await page.goto(`${BASE}/admin/appointments/new`);
  await page.fill('input[name="patientName"]', `E2E Request2 ${run}`);
  await page.fill('input[name="phone"]', "9000000006");
  await page.selectOption('select[name="clinicId"]', { label: "Whitefield" });
  await page.fill('input[name="startAt"]', local(dayAfter, "10:00"));
  await page.selectOption('select[name="status"]', "requested");
  await page.fill('input[name="holdMinutes"]', "0");
  await page.click('main button[type="submit"]');
  await page.waitForURL(/created=1/, { timeout: 20000 });
  await page.click('button:has-text("Confirm appointment")');
  await expect(page.locator('[role="alert"]:not([id])')).toContainText("not available", { timeout: 20000 });
});

test("leave blocks prevent booking; a block over existing appointments is refused and lists them", async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/admin/availability`);
  const blockForm = page.locator("#blocks form");
  // Block over Monday (has the converted appointment) → refused with the affected list
  await blockForm.locator('input[name="reason"]').fill(`E2E conflict ${run}`);
  await blockForm.locator('input[name="startDate"]').fill(nextMonday.toISODate()!);
  await blockForm.locator('button[type="submit"]').click();
  await expect(page.locator('#blocks [role="alert"]:not([id])')).toContainText("fall inside", { timeout: 20000 });
  await expect(page.locator('#blocks [role="alert"]:not([id])')).toContainText("E2E Patient");
  // Full-day leave on a free Thursday succeeds
  await blockForm.locator('input[name="reason"]').fill(`E2E leave ${run}`);
  await blockForm.locator('input[name="startDate"]').fill(freeThursday.toISODate()!);
  await blockForm.locator('button[type="submit"]').click();
  await expect(page.locator("#blocks")).toContainText(`E2E leave ${run}`, { timeout: 20000 });
  // Booking on that day is refused
  await page.goto(`${BASE}/admin/appointments/new`);
  await page.fill('input[name="patientName"]', `E2E OnLeave ${run}`);
  await page.fill('input[name="phone"]', "9000000007");
  await page.selectOption('select[name="clinicId"]', { label: "Whitefield" });
  await page.fill('input[name="startAt"]', local(freeThursday, "10:00"));
  await page.click('main button[type="submit"]');
  await expect(page.locator('[role="alert"]:not([id])')).toContainText("not available", { timeout: 20000 });
  await expect(page.locator('[role="alert"]:not([id])')).toContainText("block");
  // Public availability shows no slots that day
  const res = await page.request.get(`${BASE}/api/availability?clinic=whitefield&date=${freeThursday.toISODate()}`);
  const data = (await res.json()) as { slots: unknown[] };
  expect(data.slots).toHaveLength(0);
});

test("coordinator can work enquiries/appointments but not staff, audit or availability rules", async ({ page, browser }) => {
  await login(page);
  await page.goto(`${BASE}/admin/users`);
  await page.fill('input[name="name"]', COORD.name);
  await page.fill('input[name="email"]', COORD.email);
  await page.selectOption('select[name="role"]', "coordinator");
  await page.click('button:has-text("Create invitation")');
  const link = (await page.locator(".mono").textContent({ timeout: 20000 }))?.trim() ?? "";
  expect(link).toContain("/admin/invite/");

  const ctx = await (browser as Browser).newContext();
  const p2 = await ctx.newPage();
  await p2.goto(link);
  await p2.fill('input[name="password"]', COORD.password);
  await p2.fill('input[name="confirm"]', COORD.password);
  await p2.click('main button[type="submit"], .auth-card button[type="submit"]');
  await p2.waitForURL(/\/admin$/, { timeout: 20000 });
  await expect(p2.locator(".admin-side")).toContainText("Coordinator");
  await expect(p2.locator(".admin-side")).not.toContainText("Staff");
  await p2.goto(`${BASE}/admin/users`);
  await expect(p2.locator('[role="alert"]:not([id])')).toContainText("Not permitted");
  await p2.goto(`${BASE}/admin/audit`);
  await expect(p2.locator('[role="alert"]:not([id])')).toContainText("Not permitted");
  await p2.goto(`${BASE}/admin/availability`);
  await expect(p2.locator("#weekly form")).toHaveCount(0);
  // Direct server-action style request through the API is also refused: calendar works (allowed), nothing admin-only is reachable via GET
  const cal = await p2.request.get(`${BASE}/api/admin/calendar?start=${encodeURIComponent(nextMonday.toISO()!)}&end=${encodeURIComponent(nextMonday.plus({ days: 7 }).toISO()!)}`);
  expect(cal.status()).toBe(200);
  // Coordinator can open the enquiry list and the appointment detail
  await p2.goto(`${BASE}/admin/enquiries?status=all`);
  await expect(p2.locator("h1")).toContainText("Enquiries");
  await p2.goto(convertedApptUrl);
  await expect(p2.locator("h1")).toContainText("E2E Patient");

  // Admin deactivates the coordinator → their session ends
  await page.goto(`${BASE}/admin/users`);
  page.once("dialog", (d) => d.accept("E2E deactivate"));
  await page.locator(".card", { hasText: COORD.email }).locator('button:has-text("Deactivate")').click();
  await expect(page.locator(".card", { hasText: COORD.email })).toContainText("deactivated", { timeout: 20000 });
  await p2.goto(`${BASE}/admin/enquiries`);
  await expect(p2).toHaveURL(/\/admin\/login/);
  await ctx.close();
});

test("calendar shows appointments, holds and blocks in IST and audit history records the actions", async ({ page }) => {
  await login(page);
  await page.goto(`${BASE}/admin/calendar?date=${nextMonday.toISODate()}&view=timeGridWeek`);
  await expect(page.locator(".fc-event", { hasText: "E2E Patient" })).toBeVisible({ timeout: 20000 });
  await expect(page.locator(".fc-event", { hasText: "E2E leave" })).toBeVisible();
  await page.locator(".fc-event", { hasText: "E2E Patient" }).click();
  await expect(page.locator(".drawer")).toContainText("IST");
  await page.goto(`${BASE}/admin/audit?q=E2E`);
  await expect(page.locator("table")).toContainText("Cancelled APT-");
  await expect(page.locator("table")).toContainText("Blocked time (leave)");
  await page.goto(`${BASE}/admin/audit?entity=appointment&q=Confirmed`);
  await expect(page.locator("table")).toContainText("appointment.confirm");
});

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`admin + public render without horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await login(page);
    for (const path of ["/admin", "/admin/enquiries?status=all", "/admin/appointments?status=all", `/admin/calendar?date=${nextMonday.toISODate()}`, "/admin/availability", "/", "/contact-us.html", "/practice-location.html", "/aboutus.html", "/craniosynostosis-surgery-bangalore.html", "/testimonials.html"]) {
      await page.goto(`${BASE}${path}`);
      await page.waitForLoadState("networkidle");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `${path} overflows by ${overflow}px at ${width}`).toBeLessThanOrEqual(1);
      await page.screenshot({ path: `test-results/shots/${width}-${path.replace(/[^a-z0-9]+/gi, "_")}.png`, fullPage: true });
    }
  });
}
