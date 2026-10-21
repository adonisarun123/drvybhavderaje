import type { Db, Tx } from "./db/client";
import { auditEvents } from "./db/schema";

export interface Actor {
  id: string | null;
  label: string;
}

export const SYSTEM_ACTOR: Actor = { id: null, label: "system" };
export const PUBLIC_ACTOR: Actor = { id: null, label: "public website" };

export async function recordAudit(
  tx: Tx | Db,
  args: {
    actor: Actor;
    action: string;
    entityType: string;
    entityId?: string | null;
    summary: string;
    changes?: Record<string, unknown>;
  },
): Promise<void> {
  await tx.insert(auditEvents).values({
    actorId: args.actor.id,
    actorLabel: args.actor.label,
    action: args.action,
    entityType: args.entityType,
    entityId: args.entityId ?? null,
    summary: args.summary,
    changes: args.changes ?? null,
  });
}

/** Produce a compact before/after diff for audit payloads, skipping unchanged keys. */
export function diff<T extends Record<string, unknown>>(before: T, after: Partial<T>): Record<string, { from: unknown; to: unknown }> {
  const out: Record<string, { from: unknown; to: unknown }> = {};
  for (const key of Object.keys(after)) {
    const b = before[key];
    const a = after[key];
    const bv = b instanceof Date ? b.toISOString() : b;
    const av = a instanceof Date ? a.toISOString() : a;
    if (bv !== av) out[key] = { from: bv, to: av };
  }
  return out;
}
