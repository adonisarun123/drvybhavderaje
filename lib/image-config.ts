/** Dependency-free so next.config.ts can import it. The folder is part of the endpoint. */
export const DEFAULT_IMAGEKIT_URL_ENDPOINT = "https://ik.imagekit.io/meddeskos/drvybhavderaje";

export function imageKitEndpoint(): string {
  return (process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT ?? DEFAULT_IMAGEKIT_URL_ENDPOINT).replace(/\/$/, "");
}
