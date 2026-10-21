/**
 * Minimal phone normalisation for an Indian practice. Produces E.164 where the
 * input is unambiguous; otherwise returns null so validation can reject it.
 * Default country code +91. International numbers must include a leading "+".
 */
export function normalisePhone(raw: string, defaultCountry = "91"): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const hasPlus = trimmed.startsWith("+");
  let digits = trimmed.replace(/[^\d]/g, "");
  if (!digits) return null;
  if (hasPlus) {
    if (digits.length < 8 || digits.length > 15) return null;
    return `+${digits}`;
  }
  // Common Indian formats: 0XXXXXXXXXX (11 digits), 91XXXXXXXXXX (12), XXXXXXXXXX (10)
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  if (digits.length === 12 && digits.startsWith(defaultCountry)) return `+${digits}`;
  if (digits.length === 10) return `+${defaultCountry}${digits}`;
  if (digits.length >= 8 && digits.length <= 15) return `+${digits}`;
  return null;
}

export function formatPhone(e164: string | null | undefined): string {
  if (!e164) return "";
  if (e164.startsWith("+91") && e164.length === 13) {
    return `+91 ${e164.slice(3, 8)} ${e164.slice(8)}`;
  }
  return e164;
}
