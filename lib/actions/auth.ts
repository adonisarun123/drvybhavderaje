"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getStaffUser } from "@/lib/auth/guard";
import { type ActionResult, toActionError, ValidationError, AppError } from "@/lib/errors";
import { acceptInvitation, countUsers, createFirstAdmin } from "@/lib/staff/service";
import { safeEqual } from "@/lib/security/tokens";
import { allowRequest } from "@/lib/security/rate-limit";
import { hashIp } from "@/lib/security/tokens";

const loginSchema = z.object({ email: z.string().trim().email(), password: z.string().min(1) });

export async function signInAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { ok: false, code: "validation", message: "Enter your email and password." };
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!(await allowRequest(`login:${hashIp(ip)}`, 10, 300))) return { ok: false, code: "rate_limited", message: "Too many sign-in attempts. Wait a few minutes and try again." };
  try {
    await auth.api.signInEmail({ body: { email: parsed.data.email, password: parsed.data.password }, headers: h });
  } catch (e) {
    const status = (e as { status?: string | number }).status;
    if (status === "FORBIDDEN" || status === 403) return { ok: false, code: "deactivated", message: "This account has been deactivated. Contact an administrator." };
    return { ok: false, code: "invalid", message: "Email or password is incorrect." };
  }
  const next = String(formData.get("next") ?? "/admin");
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function signOutAction(): Promise<void> {
  await auth.api.signOut({ headers: await headers() });
  redirect("/admin/login");
}

const setupSchema = z.object({ token: z.string().min(1), name: z.string().trim().min(2).max(80), email: z.string().trim().email(), password: z.string().min(10).max(128) });

export async function setupAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const expected = process.env.ADMIN_SETUP_TOKEN;
  if (!expected) return { ok: false, code: "setup_disabled", message: "ADMIN_SETUP_TOKEN is not configured on the server." };
  const parsed = setupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, code: "validation", message: "Check the fields: a name, a valid email and a password of at least 10 characters are required." };
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!(await allowRequest(`setup:${hashIp(ip)}`, 5, 600))) return { ok: false, code: "rate_limited", message: "Too many attempts." };
  if (!safeEqual(parsed.data.token, expected)) return { ok: false, code: "bad_token", message: "The setup token is incorrect." };
  try {
    if ((await countUsers()) > 0) return { ok: false, code: "setup_done", message: "Setup has already been completed. Sign in instead." };
    await createFirstAdmin(parsed.data);
    await auth.api.signInEmail({ body: { email: parsed.data.email, password: parsed.data.password }, headers: h });
  } catch (e) {
    return toActionError(e);
  }
  redirect("/admin");
}

const acceptSchema = z.object({ token: z.string().min(10), name: z.string().trim().min(2).max(80), password: z.string().min(10).max(128), confirm: z.string() });

export async function acceptInviteAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = acceptSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, code: "validation", message: "Enter your name and a password of at least 10 characters." };
  if (parsed.data.password !== parsed.data.confirm) return { ok: false, code: "validation", message: "Passwords do not match.", fieldErrors: { confirm: ["Passwords do not match"] } };
  let email = "";
  try {
    const user = await acceptInvitation(parsed.data.token, { name: parsed.data.name, password: parsed.data.password });
    email = user.email;
    await auth.api.signInEmail({ body: { email, password: parsed.data.password }, headers: await headers() });
  } catch (e) {
    if (e instanceof AppError || e instanceof ValidationError) return toActionError(e);
    return toActionError(e);
  }
  redirect("/admin");
}

export async function currentUserAction() {
  return getStaffUser();
}
