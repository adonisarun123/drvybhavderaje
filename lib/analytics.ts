/**
 * Google Analytics 4 event helper for the public site.
 *
 * `track()` is a no-op until the visitor has accepted analytics (the GA loader in
 * components/site/google-analytics.tsx defines `window.gtag` only then), so calling it anywhere is
 * safe and never leaks data before consent. Event names follow GA4 conventions (snake_case, GA4
 * recommended names where one exists — `generate_lead`, `form_start`, `form_submit`).
 *
 * Event catalogue (all fired on the client):
 *   page_view          every client-side route change (the initial load is sent by gtag config)
 *   form_start         first interaction with the enquiry form
 *   slot_select        a published consultation time was chosen
 *   form_submit        enquiry form posted (before the server answers)
 *   form_error         submission rejected — error_type: validation | server | network | rate_limited | disabled
 *   generate_lead      enquiry saved (the key event / conversion); fired once per saved enquiry
 *   phone_click        any tel: link — link_location: header | footer | main | whatsapp_fab
 *   email_click        any mailto: link
 *   whatsapp_click     any wa.me / api.whatsapp.com link — link_location as above
 *   pdf_download       any .pdf link (patient information sheets)
 *   outbound_click     any link leaving the site (practice sites, hospitals, social, Monk Mantra)
 *   cta_click          links marked data-analytics-cta="…" (Book an appointment buttons)
 *   video_play         a YouTube embed was started — video_id, video_index
 *   consent_update     visitor used "Cookie Settings" (only reaches GA while consent is granted)
 *   thank_you_view     the /thank-you page rendered for a fresh enquiry (deduplicated per reference)
 */
export type AnalyticsEventName =
  | "page_view"
  | "form_start"
  | "slot_select"
  | "form_submit"
  | "form_error"
  | "generate_lead"
  | "phone_click"
  | "email_click"
  | "whatsapp_click"
  | "pdf_download"
  | "outbound_click"
  | "cta_click"
  | "video_play"
  | "consent_update"
  | "thank_you_view";

export type AnalyticsParams = Record<string, string | number | boolean | undefined>;

/** Name of the enquiry form in every form_* / generate_lead event, so a second form later is distinguishable. */
export const ENQUIRY_FORM_ID = "consultation_enquiry";

export function analyticsEnabled(): boolean {
  return typeof window !== "undefined" && typeof window.gtag === "function";
}

export function track(name: AnalyticsEventName, params: AnalyticsParams = {}): void {
  if (!analyticsEnabled()) return;
  const clean: AnalyticsParams = {};
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") clean[k] = v;
  try {
    window.gtag!("event", name, clean);
  } catch {
    /* analytics must never break the page */
  }
}

/** Where on the page a link lives — coarse, stable buckets for reports. */
export function linkLocation(el: Element): "header" | "footer" | "whatsapp_fab" | "main" {
  if (el.closest(".whatsapp-fab")) return "whatsapp_fab";
  if (el.closest("header, .site-header, .utility")) return "header";
  if (el.closest("footer")) return "footer";
  return "main";
}

/** Classifies an anchor for the global click tracker. Returns null for ordinary internal navigation. */
export function classifyLink(a: HTMLAnchorElement, currentHost: string): { name: AnalyticsEventName; params: AnalyticsParams } | null {
  const href = a.getAttribute("href") ?? "";
  if (!href || href.startsWith("#")) return null;
  const text = (a.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 100);
  const location = linkLocation(a);
  const cta = a.dataset.analyticsCta;

  if (href.startsWith("tel:")) return { name: "phone_click", params: { phone_number: href.slice(4), link_text: text, link_location: location } };
  if (href.startsWith("mailto:")) return { name: "email_click", params: { email_address: href.slice(7).split("?")[0], link_text: text, link_location: location } };

  let url: URL;
  try {
    url = new URL(href, `https://${currentHost}`);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "");
  const file = decodeURIComponent(url.pathname.split("/").pop() ?? "");

  if (/(^|\.)(wa\.me|whatsapp\.com)$/.test(host)) return { name: "whatsapp_click", params: { link_location: location, link_text: text } };
  if (/\.pdf$/i.test(url.pathname)) return { name: "pdf_download", params: { file_name: file, link_url: url.pathname, link_text: text, link_location: location } };
  if (host && host !== currentHost.replace(/^www\./, "")) return { name: "outbound_click", params: { link_url: url.href, link_domain: host, link_text: text, link_location: location } };
  if (cta) return { name: "cta_click", params: { cta_name: cta, link_url: url.pathname, link_text: text, link_location: location } };
  return null;
}
