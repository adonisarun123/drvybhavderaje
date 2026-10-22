/**
 * Analytics consent, shared by the cookie banner, the footer "Cookie settings" link and the GA loader.
 *
 * The choice is stored in a first-party cookie (so it survives across tabs and is readable without
 * JavaScript frameworks) and mirrored in localStorage as a fallback. Nothing from Google is loaded
 * until the value is "granted". Six-month expiry, after which the banner asks again.
 */
export const CONSENT_COOKIE = "dvd_consent";
export const CONSENT_MAX_AGE_DAYS = 180;
export const CONSENT_EVENT = "dvd-consent-change";

export type ConsentChoice = "granted" | "denied";

export function readConsent(): ConsentChoice | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=(granted|denied)`));
  if (m) return m[1] as ConsentChoice;
  try {
    const v = localStorage.getItem(CONSENT_COOKIE);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

/** Expire every Google Analytics cookie (_ga, _ga_<id>, _gid …) on this host and its parent domains. */
export function clearAnalyticsCookies(): void {
  const names = document.cookie.split("; ").map((c) => c.split("=")[0] ?? "").filter((n) => /^_ga|^_gid|^_gat/.test(n));
  const host = location.hostname;
  const parts = host.split(".");
  const domains: (string | null)[] = [null, host, `.${host}`];
  for (let i = 1; i < parts.length - 1; i++) {
    const d = parts.slice(i).join(".");
    domains.push(d, `.${d}`);
  }
  for (const n of names) {
    for (const d of domains) {
      document.cookie = `${n}=; Max-Age=0; Path=/; SameSite=Lax${d ? `; Domain=${d}` : ""}`;
    }
  }
}

export function writeConsent(choice: ConsentChoice): void {
  if (choice === "denied") clearAnalyticsCookies();
  const secure = typeof location !== "undefined" && location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${choice}; Max-Age=${CONSENT_MAX_AGE_DAYS * 86400}; Path=/; SameSite=Lax${secure}`;
  try {
    localStorage.setItem(CONSENT_COOKIE, choice);
  } catch {
    /* storage blocked: the cookie still carries the choice */
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: choice }));
}

/** Clears the stored choice so the banner shows again (used by "Cookie settings"). */
export function resetConsent(): void {
  document.cookie = `${CONSENT_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
  try {
    localStorage.removeItem(CONSENT_COOKIE);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: null }));
}
