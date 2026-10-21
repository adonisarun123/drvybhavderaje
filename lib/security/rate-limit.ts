import "server-only";
import { sql } from "drizzle-orm";
import { db } from "../db/client";

/**
 * Fixed-window rate limiter backed by Postgres so it holds across serverless
 * instances. Returns true when the request is allowed.
 */
export async function allowRequest(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const now = new Date();
  const windowStart = new Date(Math.floor(now.getTime() / (windowSeconds * 1000)) * windowSeconds * 1000);
  const res = await db.execute(sql`
    INSERT INTO rate_limits (key, window_start, count)
    VALUES (${key}, ${windowStart}, 1)
    ON CONFLICT (key) DO UPDATE SET
      count = CASE WHEN rate_limits.window_start = EXCLUDED.window_start THEN rate_limits.count + 1 ELSE 1 END,
      window_start = EXCLUDED.window_start
    RETURNING count
  `);
  const count = Number((res.rows[0] as { count: number | string }).count);
  return count <= limit;
}
