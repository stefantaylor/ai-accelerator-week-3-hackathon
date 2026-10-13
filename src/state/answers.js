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
    if (values.includes('allInsulated') || values.includes('notSure')) {
      return values.length === 1;
    }
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
      if (value.includes('allInsulated') && value.length === 1) {
        updated[field] = ['allInsulated'];
      } else if (value.includes('notSure') && value.length === 1) {
        updated[field] = ['notSure'];
      } else if (value.some(v => !['allInsulated', 'notSure'].includes(v))) {
        // Removing exclusive options if present
        updated[field] = value.filter(v => !['allInsulated', 'notSure'].includes(v));
      } else {
        updated[field] = value;
      }
    } else {
      updated[field] = value;
    }
  } else {
    // Handle string fields
    if (!validateValue(field, value)) return answers;

    // V4: Consent can only be given when the ownership type asks for it
    if (field === 'consent' && value !== '' && !needsConsent(answers.ownership)) return answers;

    updated[field] = value;

    // V4: Clear consent whenever ownership changes - rent and shared ownership
    // ask different consent questions, so an earlier answer does not carry over
    if (field === 'ownership' && value !== answers.ownership) {
      updated.consent = '';
    }
  }

  return updated;
}

export function isAnswered(field, value) {
  if (Array.isArray(value)) return value.length > 0;
  return typeof value === 'string' && value !== '';
}
