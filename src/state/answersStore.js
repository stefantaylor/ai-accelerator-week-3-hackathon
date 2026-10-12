// Session storage persistence for answers

import { emptyAnswers, setAnswer, isAnswered } from './answers.js';

const STORAGE_KEY = 'ghg-checker:v1';
const STORAGE_VERSION = 1;

// Validate loaded data against schema V1-V4
function validateSchema(data) {
  if (!data || typeof data !== 'object') return false;
  if (data.version !== STORAGE_VERSION) return false;
  if (!data.answers || typeof data.answers !== 'object') return false;

  const { answers } = data;

  // V1: String fields
  const stringFields = ['propertyType', 'ownership', 'consent', 'incomeBand', 'heating'];
  for (const field of stringFields) {
    const val = answers[field];
    if (val !== undefined && (typeof val !== 'string' || (val !== '' && !isValidValue(field, val)))) {
      return false;
    }
  }

  // V2: Array fields
  const arrayFields = ['priorGrants', 'uninsulatedParts'];
  for (const field of arrayFields) {
    const val = answers[field];
    if (val !== undefined) {
      if (!Array.isArray(val)) return false;
      if (!isValidArray(field, val)) return false;
    }
  }

  // V3: Exclusive options
  if (answers.priorGrants && answers.priorGrants.includes('none') && answers.priorGrants.length > 1) {
    return false;
  }
  if (answers.uninsulatedParts) {
    if ((answers.uninsulatedParts.includes('allInsulated') || answers.uninsulatedParts.includes('notSure'))
      && answers.uninsulatedParts.length > 1) {
      return false;
    }
  }

  // V4: Consent only when needed
  if (answers.consent && answers.ownership && answers.ownership !== 'sharedOwnership' && answers.ownership !== 'rent') {
    if (answers.consent !== '') return false;
  }

  return true;
}

function isValidValue(field, value) {
  const allowed = {
    propertyType: ['detached', 'semiDetached', 'terraced', 'flat', 'bungalow'],
    ownership: ['ownOutright', 'mortgage', 'sharedOwnership', 'rent'],
    consent: ['yes', 'no'],
    incomeBand: ['under12570', '12571to50270', '50271to125140', 'over125141'],
    heating: ['gasBoiler', 'oilBoiler', 'electric', 'heatPump', 'other'],
  };
  return allowed[field] && allowed[field].includes(value);
}

function isValidArray(field, values) {
  const allowed = {
    priorGrants: ['insulation', 'heatPump', 'none'],
    uninsulatedParts: ['loft', 'walls', 'floor', 'allInsulated', 'notSure'],
  };
  if (!allowed[field]) return false;
  const seen = new Set();
  for (const val of values) {
    if (!allowed[field].includes(val) || seen.has(val)) return false;
    seen.add(val);
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
  } catch (e) {
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
  } catch (e) {
    // Storage unavailable or quota exceeded - silently fail
    // (app continues to work in-memory only)
  }
}
