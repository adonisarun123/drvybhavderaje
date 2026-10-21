import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins/admin";
import { nextCookies } from "better-auth/next-js";
import { db } from "../db/client";
import { ac, roles } from "./access";
import * as schema from "../db/schema";

export const auth = betterAuth({
  baseURL: process.env.SITE_ORIGIN,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: { enabled: true, disableSignUp: true, minPasswordLength: 10 },
  session: { expiresIn: 60 * 60 * 12, updateAge: 60 * 30, cookieCache: { enabled: false } },
  user: { changeEmail: { enabled: false } },
  plugins: [admin({ ac, roles, adminRoles: ["admin"], defaultRole: "coordinator" }), nextCookies()],
  rateLimit: { enabled: true, storage: "database", modelName: "authRateLimit", window: 60, max: 30 },
  trustedOrigins: process.env.SITE_ORIGIN ? [process.env.SITE_ORIGIN] : [],
  advanced: { database: { generateId: "uuid" } },
});

export type Session = typeof auth.$Infer.Session;
