import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  customType,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  smallint,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ */
/* Better Auth tables (property names must stay camelCase for the      */
/* adapter; column names are snake_case via `casing: "snake_case"`).   */
/* ------------------------------------------------------------------ */

export const user = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  // admin plugin
  role: text("role").notNull().default("coordinator"),
  banned: boolean("banned").notNull().default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires", { withTimezone: true }),
});

export const session = pgTable(
  "session",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonated_by"),
  },
  (t) => [index("session_user_id_idx").on(t.userId)],
);

export const account = pgTable(
  "account",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("account_user_id_idx").on(t.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);

/* ------------------------------------------------------------------ */
/* Staff permissions and invitations                                   */
/* ------------------------------------------------------------------ */

export const PERMISSIONS = [
  "availability:manage",
  "clinics:manage",
  "audit:view",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

export const userPermissions = pgTable(
  "user_permissions",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    permission: text("permission").notNull(),
    grantedBy: uuid("granted_by").references(() => user.id, { onDelete: "set null" }),
    grantedAt: timestamp("granted_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.permission] })],
);

export const invitations = pgTable(
  "invitations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    role: text("role").notNull(), // admin | coordinator
    permissions: jsonb("permissions").$type<Permission[]>().notNull().default([]),
    tokenHash: text("token_hash").notNull().unique(),
    invitedBy: uuid("invited_by").references(() => user.id, { onDelete: "set null" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    acceptedUserId: uuid("accepted_user_id").references(() => user.id, { onDelete: "set null" }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("invitations_email_idx").on(t.email)],
);

/* ------------------------------------------------------------------ */
/* Practice master data                                                */
/* ------------------------------------------------------------------ */

export const doctors = pgTable("doctors", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  timezone: text("timezone").notNull().default("Asia/Kolkata"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const clinics = pgTable("clinics", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(), // e.g. Whitefield
  brand: text("brand").notNull().default(""), // e.g. Aesthetica Veda
  addressLines: text("address_lines").notNull(),
  city: text("city").notNull().default("Bengaluru"),
  postcode: text("postcode"),
  phone: text("phone"),
  email: text("email"),
  mapsUrl: text("maps_url"),
  publicNotes: text("public_notes"),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const schedulingSettings = pgTable("scheduling_settings", {
  doctorId: uuid("doctor_id")
    .primaryKey()
    .references(() => doctors.id, { onDelete: "cascade" }),
  defaultDurationMin: integer("default_duration_min").notNull().default(30),
  slotStepMin: integer("slot_step_min").notNull().default(30),
  bufferMin: integer("buffer_min").notNull().default(0),
  travelBufferMin: integer("travel_buffer_min").notNull().default(60),
  minNoticeHours: integer("min_notice_hours").notNull().default(24),
  maxHorizonDays: integer("max_horizon_days").notNull().default(60),
  publicSlotsEnabled: boolean("public_slots_enabled").notNull().default(false),
  holdMinutes: integer("hold_minutes").notNull().default(30),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  updatedBy: uuid("updated_by").references(() => user.id, { onDelete: "set null" }),
});

/** Recurring weekly working sessions, stored in local clinic time. */
export const weeklySessions = pgTable(
  "weekly_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    doctorId: uuid("doctor_id")
      .notNull()
      .references(() => doctors.id, { onDelete: "cascade" }),
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinics.id, { onDelete: "cascade" }),
    weekday: smallint("weekday").notNull(), // 0 = Sunday … 6 = Saturday (local)
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    timezone: text("timezone").notNull().default("Asia/Kolkata"),
    effectiveFrom: date("effective_from"),
    effectiveTo: date("effective_to"),
    active: boolean("active").notNull().default(true),
    createdBy: uuid("created_by").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("weekly_sessions_doctor_weekday_idx").on(t.doctorId, t.weekday)],
);

/** Date-specific sessions: `replace` discards weekly sessions for that date; `add` adds to them. */
export const dateOverrides = pgTable(
  "date_overrides",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    doctorId: uuid("doctor_id")
      .notNull()
      .references(() => doctors.id, { onDelete: "cascade" }),
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinics.id, { onDelete: "cascade" }),
    date: date("date").notNull(), // local date
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    timezone: text("timezone").notNull().default("Asia/Kolkata"),
    mode: text("mode").notNull().default("add"), // add | replace
    note: text("note"),
    createdBy: uuid("created_by").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("date_overrides_doctor_date_idx").on(t.doctorId, t.date)],
);

/** Recurring unavailable periods (breaks, standing commitments). */
export const recurringBlocks = pgTable(
  "recurring_blocks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    doctorId: uuid("doctor_id")
      .notNull()
      .references(() => doctors.id, { onDelete: "cascade" }),
    weekdays: jsonb("weekdays").$type<number[]>().notNull(), // 0..6
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    timezone: text("timezone").notNull().default("Asia/Kolkata"),
    startsOn: date("starts_on"),
    endsOn: date("ends_on"),
    kind: text("kind").notNull().default("block"), // break | block
    reason: text("reason").notNull(),
    active: boolean("active").notNull().default(true),
    createdBy: uuid("created_by").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("recurring_blocks_doctor_idx").on(t.doctorId)],
);

/** Concrete blocks: leave, holidays, full- or partial-day unavailability (UTC instants). */
export const blocks = pgTable(
  "blocks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    doctorId: uuid("doctor_id")
      .notNull()
      .references(() => doctors.id, { onDelete: "cascade" }),
    clinicId: uuid("clinic_id").references(() => clinics.id, { onDelete: "set null" }),
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true }).notNull(),
    allDay: boolean("all_day").notNull().default(false),
    kind: text("kind").notNull().default("block"), // leave | holiday | block
    reason: text("reason").notNull(), // private
    createdBy: uuid("created_by").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [index("blocks_doctor_start_idx").on(t.doctorId, t.startAt)],
);

/* ------------------------------------------------------------------ */
/* Enquiries                                                           */
/* ------------------------------------------------------------------ */

export const ENQUIRY_STATUSES = [
  "new",
  "contacted",
  "awaiting_response",
  "appointment_requested",
  "converted",
  "closed",
  "spam",
] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export const ENQUIRY_SOURCES = ["website", "phone", "walk_in", "referral", "email", "other"] as const;
export type EnquirySource = (typeof ENQUIRY_SOURCES)[number];

export const enquiries = pgTable(
  "enquiries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reference: text("reference").notNull().unique(),
    name: text("name").notNull(),
    phoneRaw: text("phone_raw").notNull(),
    phoneE164: text("phone_e164").notNull(),
    email: text("email"),
    clinicId: uuid("clinic_id").references(() => clinics.id, { onDelete: "set null" }),
    clinicPreference: text("clinic_preference"), // e.g. "help_me_choose"
    preferredStartAt: timestamp("preferred_start_at", { withTimezone: true }),
    preferredNote: text("preferred_note"),
    /** Optional free-text reason the patient gives on the website form. */
    remarks: text("remarks"),
    source: text("source").notNull().default("website"),
    status: text("status").notNull().default("new"),
    assignedTo: uuid("assigned_to").references(() => user.id, { onDelete: "set null" }),
    followUpAt: timestamp("follow_up_at", { withTimezone: true }),
    consentAt: timestamp("consent_at", { withTimezone: true }),
    consentVersion: text("consent_version"),
    idempotencyKey: text("idempotency_key").unique(),
    ipHash: text("ip_hash"),
    userAgent: text("user_agent"),
    receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
    closedAt: timestamp("closed_at", { withTimezone: true }),
    createdBy: uuid("created_by").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("enquiries_status_idx").on(t.status),
    index("enquiries_received_idx").on(t.receivedAt),
    index("enquiries_assigned_idx").on(t.assignedTo),
    index("enquiries_follow_up_idx").on(t.followUpAt),
  ],
);

export const enquiryNotes = pgTable(
  "enquiry_notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    enquiryId: uuid("enquiry_id")
      .notNull()
      .references(() => enquiries.id, { onDelete: "cascade" }),
    authorId: uuid("author_id").references(() => user.id, { onDelete: "set null" }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("enquiry_notes_enquiry_idx").on(t.enquiryId)],
);

/* ------------------------------------------------------------------ */
/* Appointments, holds and the authoritative occupancy table           */
/* ------------------------------------------------------------------ */

export const APPOINTMENT_STATUSES = [
  "requested",
  "confirmed",
  "arrived",
  "completed",
  "no_show",
  "cancelled",
] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

/** Statuses whose time is occupied on the schedule. */
export const OCCUPYING_STATUSES: readonly AppointmentStatus[] = ["confirmed", "arrived", "completed"];

export const appointments = pgTable(
  "appointments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reference: text("reference").notNull().unique(),
    doctorId: uuid("doctor_id")
      .notNull()
      .references(() => doctors.id),
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinics.id),
    enquiryId: uuid("enquiry_id").references(() => enquiries.id, { onDelete: "set null" }),
    patientName: text("patient_name").notNull(),
    phoneE164: text("phone_e164").notNull(),
    email: text("email"),
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true }).notNull(),
    status: text("status").notNull().default("requested"),
    source: text("source").notNull().default("phone"),
    notes: text("notes"), // operational, private
    outsideHoursAck: boolean("outside_hours_ack").notNull().default(false),
    cancellationReason: text("cancellation_reason"),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    cancelledBy: uuid("cancelled_by").references(() => user.id, { onDelete: "set null" }),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    confirmedBy: uuid("confirmed_by").references(() => user.id, { onDelete: "set null" }),
    arrivedAt: timestamp("arrived_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    idempotencyKey: text("idempotency_key").unique(),
    createdBy: uuid("created_by").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("appointments_doctor_start_idx").on(t.doctorId, t.startAt),
    index("appointments_status_idx").on(t.status),
    index("appointments_enquiry_idx").on(t.enquiryId),
    index("appointments_phone_idx").on(t.phoneE164),
  ],
);

export const holds = pgTable(
  "holds",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    doctorId: uuid("doctor_id")
      .notNull()
      .references(() => doctors.id),
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinics.id),
    appointmentId: uuid("appointment_id").references(() => appointments.id, { onDelete: "set null" }),
    enquiryId: uuid("enquiry_id").references(() => enquiries.id, { onDelete: "set null" }),
    label: text("label").notNull(),
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    releasedAt: timestamp("released_at", { withTimezone: true }),
    releaseReason: text("release_reason"),
    createdBy: uuid("created_by").references(() => user.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("holds_doctor_start_idx").on(t.doctorId, t.startAt)],
);

const tstzrange = customType<{ data: string; driverData: string }>({
  dataType() {
    return "tstzrange";
  },
});

/**
 * One authoritative occupancy table. Every confirmed appointment, active hold and
 * concrete block has exactly one row here. A GiST exclusion constraint (added in the
 * SQL migration, see drizzle/0001_occupancy_constraints.sql) guarantees that two
 * appointment/hold rows for the same doctor can never overlap, independent of any
 * application logic. Blocks are checked inside the advisory-locked transaction.
 */
export const occupancy = pgTable(
  "occupancy",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    doctorId: uuid("doctor_id")
      .notNull()
      .references(() => doctors.id),
    clinicId: uuid("clinic_id").references(() => clinics.id),
    kind: text("kind").notNull(), // appointment | hold | block
    span: tstzrange("span").notNull(),
    appointmentId: uuid("appointment_id").references(() => appointments.id, { onDelete: "cascade" }),
    holdId: uuid("hold_id").references(() => holds.id, { onDelete: "cascade" }),
    blockId: uuid("block_id").references(() => blocks.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }), // holds only
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("occupancy_doctor_idx").on(t.doctorId),
    uniqueIndex("occupancy_appointment_uniq").on(t.appointmentId).where(sql`appointment_id IS NOT NULL`),
    uniqueIndex("occupancy_hold_uniq").on(t.holdId).where(sql`hold_id IS NOT NULL`),
    uniqueIndex("occupancy_block_uniq").on(t.blockId).where(sql`block_id IS NOT NULL`),
  ],
);

/* ------------------------------------------------------------------ */
/* Audit, notifications, rate limiting                                 */
/* ------------------------------------------------------------------ */

export const auditEvents = pgTable(
  "audit_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: uuid("actor_id").references(() => user.id, { onDelete: "set null" }),
    actorLabel: text("actor_label").notNull(), // name/email snapshot or "public" / "system"
    action: text("action").notNull(), // e.g. appointment.confirm
    entityType: text("entity_type").notNull(),
    entityId: uuid("entity_id"),
    summary: text("summary").notNull(),
    changes: jsonb("changes").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("audit_entity_idx").on(t.entityType, t.entityId),
    index("audit_created_idx").on(t.createdAt),
  ],
);

export const notificationLog = pgTable(
  "notification_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    channel: text("channel").notNull(), // email | sms
    recipient: text("recipient").notNull(),
    template: text("template").notNull(),
    appointmentId: uuid("appointment_id").references(() => appointments.id, { onDelete: "set null" }),
    enquiryId: uuid("enquiry_id").references(() => enquiries.id, { onDelete: "set null" }),
    status: text("status").notNull(), // not_configured | queued | sent | failed
    provider: text("provider"),
    providerMessageId: text("provider_message_id"),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
  },
  (t) => [index("notification_appointment_idx").on(t.appointmentId)],
);

export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
  count: integer("count").notNull().default(0),
});

export type Doctor = typeof doctors.$inferSelect;
export type Clinic = typeof clinics.$inferSelect;
export type SchedulingSettings = typeof schedulingSettings.$inferSelect;
export type WeeklySession = typeof weeklySessions.$inferSelect;
export type DateOverride = typeof dateOverrides.$inferSelect;
export type RecurringBlock = typeof recurringBlocks.$inferSelect;
export type Block = typeof blocks.$inferSelect;
export type Enquiry = typeof enquiries.$inferSelect;
export type EnquiryNote = typeof enquiryNotes.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type Hold = typeof holds.$inferSelect;
export type AuditEvent = typeof auditEvents.$inferSelect;
export type User = typeof user.$inferSelect;
export type Invitation = typeof invitations.$inferSelect;

/** Better Auth's own rate-limit storage (sign-in attempts etc.), DB-backed so it works on serverless. */
export const authRateLimit = pgTable("auth_rate_limit", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  count: integer("count").notNull(),
  lastRequest: bigint("last_request", { mode: "number" }).notNull(),
});
