export function enquiriesEnabled(): boolean {
  return process.env.ENQUIRIES_ENABLED === "true" && !!process.env.DATABASE_URL;
}
