import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle, type NeonDatabase } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";
import { resolveWebSocketConstructor } from "./websocket";

const wsCtor = resolveWebSocketConstructor();
if (wsCtor) neonConfig.webSocketConstructor = wsCtor;

const globalForDb = globalThis as unknown as { __drPool?: Pool; __drDb?: NeonDatabase<typeof schema> };

export function getPool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }
  if (!globalForDb.__drPool) {
    globalForDb.__drPool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
  }
  return globalForDb.__drPool;
}

export function getDb(): NeonDatabase<typeof schema> {
  if (!globalForDb.__drDb) {
    globalForDb.__drDb = drizzle({ client: getPool(), schema, casing: "snake_case" });
  }
  return globalForDb.__drDb;
}

/**
 * Lazily-initialised database handle. The pool is only created on first use so
 * modules can be imported (e.g. during `next build`) without DATABASE_URL.
 */
export const db: NeonDatabase<typeof schema> = new Proxy({} as NeonDatabase<typeof schema>, {
  get(_target, prop) {
    const real = getDb() as unknown as Record<string | symbol, unknown>;
    const value = real[prop];
    return typeof value === "function" ? (value as (...args: unknown[]) => unknown).bind(real) : value;
  },
});

export type Db = NeonDatabase<typeof schema>;
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
