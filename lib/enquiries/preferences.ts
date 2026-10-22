/**
 * Values the public enquiry form can send in the `clinic` field that are not a clinic slug. They are
 * stored in `enquiries.clinic_preference` and shown to staff with these labels.
 */
export const CLINIC_PREFERENCES = {
  help_me_choose: "Help me choose",
  video_consultation: "Video consultation (outside Bangalore / India)",
} as const;

export type ClinicPreference = keyof typeof CLINIC_PREFERENCES;

export function isClinicPreference(v: string): v is ClinicPreference {
  return Object.prototype.hasOwnProperty.call(CLINIC_PREFERENCES, v);
}

export function clinicPreferenceLabel(v: string | null | undefined, fallback: string): string {
  return v && isClinicPreference(v) ? CLINIC_PREFERENCES[v] : fallback;
}
