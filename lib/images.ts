/**
 * Image hosting: all site images live in ImageKit (media library folder /drvybhavderaje) and are
 * served, resized and format-converted by ImageKit's CDN. Only the patient-information PDFs stay in
 * /public (they must keep their exact legacy URLs).
 *
 * Image paths in content are RELATIVE TO THE FOLDER, e.g. "/custom/gallery_1.png" — the same tree the
 * legacy site had under /images/. `next.config.ts` 308-redirects the legacy /images/… URLs to ImageKit.
 */
import { imageKitEndpoint } from "./image-config";

export { DEFAULT_IMAGEKIT_URL_ENDPOINT, imageKitEndpoint } from "./image-config";

/** Absolute CDN URL for an image path, optionally resized (for Open Graph, schema and the sitemap). Server-safe. */
export function imageUrl(src: string, width?: number): string {
  const path = src.startsWith("/") ? src : `/${src}`;
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `${imageKitEndpoint()}${encoded}${width ? `?tr=w-${width}` : ""}`;
}

export const DOCTOR_PHOTO = "/doctor.png";
