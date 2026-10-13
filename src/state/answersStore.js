// Session storage persistence for answers

import {
  emptyAnswers,
  STRING_FIELDS,
  ARRAY_FIELDS,
  validateValue,
  validateArray,
  isExclusive,
  needsConsent,
} from './answers.js';

const STORAGE_KEY = 'ghg-checker:v1';
const STORAGE_VERSION = 1;

// Validate loaded data against schema rules V1-V4 (shared with answers.js)
function validateSchema(data) {
  if (!data || typeof data !== 'object') return false;
  if (data.version !== STORAGE_VERSION) return false;
  if (!data.answers || typeof data.answers !== 'object') return false;

  const { answers } = data;

  // V1: String fields
  for (const field of STRING_FIELDS) {
    const val = answers[field];
    if (val !== undefined && !validateValue(field, val)) return false;
  }

  // V2 and V3: Array fields, with exclusive options
  for (const field of ARRAY_FIELDS) {
    const val = answers[field];
    if (val !== undefined) {
      if (!validateArray(field, val)) return false;
      if (!isExclusive(field, val)) return false;
    }
  }

  // V4: Consent only when needed
  if (answers.consent && answers.ownership && !needsConsent(answers.ownership)) {
    return false;
  }

  return true;
}

export function load() {
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return { ...emptyAnswers };

    const parsed = JSON.parse(stored);
    if (!validateSchema(parsed)) {
      return { ...emptyAnswers };
    }

    // Merge with empty answers to ensure all fields exist
    return { ...emptyAnswers, ...parsed.answers };
  } catch {
    // Storage unavailable or parse error - return empty
    return { ...emptyAnswers };
  }
}

export function save(answers) {
  try {
    const toStore = {
      version: STORAGE_VERSION,
      answers,
    };
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch {
    // Storage unavailable or quota exceeded - silently fail
    // (app continues to work in-memory only)
  }
}
