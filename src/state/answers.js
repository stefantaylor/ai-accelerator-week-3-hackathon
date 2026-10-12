// Answers data model with validation and state management

export const emptyAnswers = {
  priorGrants: [],
  propertyType: '',
  ownership: '',
  consent: '',
  incomeBand: '',
  uninsulatedParts: [],
  heating: '',
};

const ALLOWED_VALUES = {
  priorGrants: ['insulation', 'heatPump', 'none'],
  propertyType: ['detached', 'semiDetached', 'terraced', 'flat', 'bungalow'],
  ownership: ['ownOutright', 'mortgage', 'sharedOwnership', 'rent'],
  consent: ['yes', 'no'],
  incomeBand: ['under12570', '12571to50270', '50271to125140', 'over125141'],
  uninsulatedParts: ['loft', 'walls', 'floor', 'allInsulated', 'notSure'],
  heating: ['gasBoiler', 'oilBoiler', 'electric', 'heatPump', 'other'],
};

// V1: Validate single value against allowed list
function validateValue(field, value) {
  if (typeof value !== 'string') return false;
  if (value === '') return true; // unanswered is valid
  const allowed = ALLOWED_VALUES[field];
  return allowed && allowed.includes(value);
}

// V2: Validate array contains only allowed values with no duplicates
function validateArray(field, values) {
  if (!Array.isArray(values)) return false;
  if (values.length === 0) return true; // empty array is valid
  const allowed = ALLOWED_VALUES[field];
  const seen = new Set();
  for (const val of values) {
    if (!allowed.includes(val) || seen.has(val)) return false;
    seen.add(val);
  }
  return true;
}

// V3: Enforce exclusive options
function isExclusive(field, values) {
  if (field === 'priorGrants' && values.includes('none')) {
    return values.length === 1;
  }
  if (field === 'uninsulatedParts') {
    // Q5a: allInsulated is exclusive, but notSure can be mixed with parts
    if (values.includes('allInsulated')) {
      return values.length === 1;
    }
    // notSure can be combined with specific parts
  }
  return true;
}

// V4: Consent only required for sharedOwnership/rent
function needsConsent(ownership) {
  return ownership === 'sharedOwnership' || ownership === 'rent';
}

// Apply V3 and V4 rules when setting an answer
export function setAnswer(answers, field, value) {
  const updated = { ...answers };

  // Handle array fields
  if (field === 'priorGrants' || field === 'uninsulatedParts') {
    if (!validateArray(field, value)) return answers;
    if (!isExclusive(field, value)) return answers;

    // V3: When setting exclusive option, clear others
    if (field === 'priorGrants' && value.includes('none') && value.length === 1) {
      updated[field] = ['none'];
    } else if (field === 'uninsulatedParts') {
      // Q5a: allInsulated is exclusive, but notSure can be mixed with parts
      if (value.includes('allInsulated')) {
        // allInsulated cannot be combined with anything
        updated[field] = value.includes('allInsulated') ? ['allInsulated'] : value;
      } else {
        // notSure can be combined with specific parts
        updated[field] = value;
      }
    } else {
      updated[field] = value;
    }
  } else {
    // Handle string fields
    if (!validateValue(field, value)) return answers;
    updated[field] = value;

    // V4: Clear consent if ownership changes to a type that doesn't need it
    if (field === 'ownership' && !needsConsent(value)) {
      updated.consent = '';
    }
  }

  return updated;
}

export function isAnswered(field, value) {
  if (Array.isArray(value)) return value.length > 0;
  return typeof value === 'string' && value !== '';
}
