import "./load-env";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import { resolveWebSocketConstructor } from "../lib/db/websocket";

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  const wsCtor = resolveWebSocketConstructor();
  if (wsCtor) neonConfig.webSocketConstructor = wsCtor;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle({ client: pool });
  console.log("Applying migrations from ./drizzle …");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migrations applied.");
  await pool.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
