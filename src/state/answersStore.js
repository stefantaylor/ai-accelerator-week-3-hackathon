// The only module that touches sessionStorage (spec §3.4, §3.5, §5.3).
// A later backend replaces this module only.
import { emptyAnswers, isValidAnswers } from './answers';
import { isExpired } from './expiry';

export const STORAGE_KEY = 'ghg-checker';
const VERSION = 2;

const nothingStored = () => ({ answers: emptyAnswers, savedAt: null, expired: false });

function storage() {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function clear() {
  try {
    storage()?.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable: nothing to clear.
  }
}

export function save(answers, now) {
  try {
    storage()?.setItem(STORAGE_KEY, JSON.stringify({ version: VERSION, savedAt: now, answers }));
  } catch {
    // Storage unavailable or full: carry on with in-memory state only.
  }
}

export function load(now) {
  let raw;
  try {
    raw = storage()?.getItem(STORAGE_KEY);
  } catch {
    return nothingStored();
  }
  if (raw === null || raw === undefined) return nothingStored();

  let stored;
  try {
    stored = JSON.parse(raw);
  } catch {
    clear();
    return nothingStored();
  }

  const savedAt = stored?.savedAt;
  const valid =
    stored?.version === VERSION &&
    typeof savedAt === 'number' &&
    Number.isFinite(savedAt) &&
    savedAt <= now &&
    isValidAnswers(stored.answers);

  if (!valid) {
    clear();
    return nothingStored();
  }
  if (isExpired(savedAt, now)) {
    clear();
    return { answers: emptyAnswers, savedAt: null, expired: true };
  }
  return { answers: stored.answers, savedAt, expired: false };
}
