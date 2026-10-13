// How long answers are kept after the last progression (spec §3.4, §4.8).

export const ANSWERS_TTL_MS = 10 * 60 * 1000;
export const WARNING_AFTER_MS = 8 * 60 * 1000;

export function isExpired(savedAt, now) {
  return savedAt !== null && now - savedAt >= ANSWERS_TTL_MS;
}

export function isWarningDue(savedAt, now) {
  return savedAt !== null && now - savedAt >= WARNING_AFTER_MS && !isExpired(savedAt, now);
}
