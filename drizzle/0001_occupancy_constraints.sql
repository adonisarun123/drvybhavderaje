-- Custom migration: extensions, hard occupancy guarantees, reference sequences.
CREATE EXTENSION IF NOT EXISTS btree_gist;
--> statement-breakpoint
-- Hard guarantee: for one doctor, no two appointment/hold occupancy rows may overlap.
-- Blocks are allowed to overlap other blocks (e.g. leave + a recurring break), so they are
-- excluded from the constraint and checked inside the advisory-locked booking transaction.
ALTER TABLE "occupancy"
  ADD CONSTRAINT "occupancy_no_double_booking"
  EXCLUDE USING gist ("doctor_id" WITH =, "span" WITH &&)
  WHERE ("kind" IN ('appointment', 'hold'));
--> statement-breakpoint
ALTER TABLE "occupancy" ADD CONSTRAINT "occupancy_span_nonempty" CHECK (NOT isempty("span"));
--> statement-breakpoint
ALTER TABLE "occupancy" ADD CONSTRAINT "occupancy_kind_check" CHECK ("kind" IN ('appointment', 'hold', 'block'));
--> statement-breakpoint
ALTER TABLE "occupancy" ADD CONSTRAINT "occupancy_source_check" CHECK (
  ("kind" = 'appointment' AND "appointment_id" IS NOT NULL) OR
  ("kind" = 'hold' AND "hold_id" IS NOT NULL AND "expires_at" IS NOT NULL) OR
  ("kind" = 'block' AND "block_id" IS NOT NULL)
);
--> statement-breakpoint
CREATE INDEX "occupancy_span_gist_idx" ON "occupancy" USING gist ("doctor_id", "span");
--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_time_order" CHECK ("end_at" > "start_at");
--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_status_check" CHECK ("status" IN ('requested','confirmed','arrived','completed','no_show','cancelled'));
--> statement-breakpoint
ALTER TABLE "holds" ADD CONSTRAINT "holds_time_order" CHECK ("end_at" > "start_at");
--> statement-breakpoint
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_time_order" CHECK ("end_at" > "start_at");
--> statement-breakpoint
ALTER TABLE "weekly_sessions" ADD CONSTRAINT "weekly_sessions_time_order" CHECK ("end_time" > "start_time");
--> statement-breakpoint
ALTER TABLE "weekly_sessions" ADD CONSTRAINT "weekly_sessions_weekday_range" CHECK ("weekday" BETWEEN 0 AND 6);
--> statement-breakpoint
ALTER TABLE "date_overrides" ADD CONSTRAINT "date_overrides_time_order" CHECK ("end_time" > "start_time");
--> statement-breakpoint
ALTER TABLE "date_overrides" ADD CONSTRAINT "date_overrides_mode_check" CHECK ("mode" IN ('add','replace'));
--> statement-breakpoint
ALTER TABLE "recurring_blocks" ADD CONSTRAINT "recurring_blocks_time_order" CHECK ("end_time" > "start_time");
--> statement-breakpoint
ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_status_check" CHECK ("status" IN ('new','contacted','awaiting_response','appointment_requested','converted','closed','spam'));
--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_role_check" CHECK ("role" IN ('admin','coordinator'));
--> statement-breakpoint
CREATE SEQUENCE IF NOT EXISTS "enquiry_reference_seq" START 1001;
--> statement-breakpoint
CREATE SEQUENCE IF NOT EXISTS "appointment_reference_seq" START 1001;
