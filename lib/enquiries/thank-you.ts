import { ROUTES } from "@/lib/routes";

/**
 * Hand-off between the enquiry form and the /thank-you page.
 *
 * The reference travels in the query string (so the page is reloadable and the clinic can be told
 * "I got ENQ-…"); a copy in sessionStorage lets the page tell a fresh submission apart from a
 * revisit or a direct hit, which is what keeps the analytics honest (thank_you_view once per
 * reference, never on reload).
 */
export const ENQUIRY_SESSION_KEY = "dvd_enquiry";

export interface EnquiryHandoff {
  reference: string;
  clinic: string;
  duplicate: boolean;
}

export function thankYouPath(h: EnquiryHandoff): string {
  const q = new URLSearchParams({ ref: h.reference });
  if (h.clinic) q.set("clinic", h.clinic);
  if (h.duplicate) q.set("dup", "1");
  return `${ROUTES.thankYou}?${q.toString()}`;
}

export function rememberEnquiry(h: EnquiryHandoff): void {
  try {
    sessionStorage.setItem(ENQUIRY_SESSION_KEY, JSON.stringify({ ...h, at: Date.now(), seen: false }));
  } catch {
    /* storage blocked: the page still works from the query string */
  }
}

/** True exactly once per saved enquiry: the first time /thank-you renders for that reference. */
export function consumeFreshEnquiry(reference: string): boolean {
  try {
    const raw = sessionStorage.getItem(ENQUIRY_SESSION_KEY);
    if (!raw) return false;
    const h = JSON.parse(raw) as EnquiryHandoff & { seen?: boolean };
    if (h.reference !== reference || h.seen) return false;
    sessionStorage.setItem(ENQUIRY_SESSION_KEY, JSON.stringify({ ...h, seen: true }));
    return true;
  } catch {
    return false;
  }
}

/** Public enquiry references look like ENQ-XXXX; anything else in the URL is ignored. */
export function isDisplayableReference(ref: string | undefined): ref is string {
  return !!ref && /^[A-Z]{2,5}-[A-Z0-9-]{3,24}$/.test(ref);
}
