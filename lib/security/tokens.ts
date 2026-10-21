import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT ?? process.env.BETTER_AUTH_SECRET ?? "ip-salt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}
