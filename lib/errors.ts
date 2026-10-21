import type { Conflict } from "./scheduling/availability";

export class AppError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(code: string, message: string, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super("not_found", message, 404);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to do this") {
    super("forbidden", message, 403);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Sign in required") {
    super("unauthorized", message, 401);
  }
}

export class ValidationError extends AppError {
  readonly fieldErrors: Record<string, string[]>;
  constructor(message: string, fieldErrors: Record<string, string[]> = {}) {
    super("validation", message, 422);
    this.fieldErrors = fieldErrors;
  }
}

/** Raised when a booking cannot proceed; carries the conflicts so staff can resolve them. */
export class ConflictError extends AppError {
  readonly conflicts: Conflict[];
  readonly affected: AffectedAppointment[];
  constructor(message: string, conflicts: Conflict[] = [], affected: AffectedAppointment[] = []) {
    super("conflict", message, 409);
    this.conflicts = conflicts;
    this.affected = affected;
  }
}

export interface AffectedAppointment {
  id: string;
  reference: string;
  patientName: string;
  startAt: Date;
  endAt: Date;
  status: string;
  clinicName?: string;
}

/** Raised when a request must be acknowledged (e.g. booking outside working hours). */
export class AcknowledgementRequired extends AppError {
  readonly reasons: string[];
  constructor(reasons: string[]) {
    super("ack_required", reasons.join(" "), 409);
    this.reasons = reasons;
  }
}

export function isAppError(e: unknown): e is AppError {
  return e instanceof AppError;
}

/** Serialisable result for server actions / API routes. */
export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | {
      ok: false;
      code: string;
      message: string;
      fieldErrors?: Record<string, string[]>;
      conflicts?: SerialisedConflict[];
      affected?: SerialisedAffected[];
      reasons?: string[];
    };

export interface SerialisedConflict {
  kind: Conflict["kind"];
  refId: string;
  start: string;
  end: string;
  label: string;
}
export interface SerialisedAffected {
  id: string;
  reference: string;
  patientName: string;
  startAt: string;
  endAt: string;
  status: string;
  clinicName?: string;
}

export function toActionError(e: unknown): ActionResult<never> {
  if (e instanceof ConflictError) {
    return {
      ok: false,
      code: e.code,
      message: e.message,
      conflicts: e.conflicts.map((c) => ({ ...c, start: c.start.toISOString(), end: c.end.toISOString() })),
      affected: e.affected.map((a) => ({ ...a, startAt: a.startAt.toISOString(), endAt: a.endAt.toISOString() })),
    };
  }
  if (e instanceof AcknowledgementRequired) {
    return { ok: false, code: e.code, message: e.message, reasons: e.reasons };
  }
  if (e instanceof ValidationError) {
    return { ok: false, code: e.code, message: e.message, fieldErrors: e.fieldErrors };
  }
  if (e instanceof AppError) {
    return { ok: false, code: e.code, message: e.message };
  }
  console.error("Unhandled error", e);
  return {
    ok: false,
    code: "internal",
    message: "Something went wrong and the change was not saved. Please try again; if it keeps failing, contact the administrator.",
  };
}
