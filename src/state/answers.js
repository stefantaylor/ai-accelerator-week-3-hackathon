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

export const STRING_FIELDS = ['propertyType', 'ownership', 'consent', 'incomeBand', 'heating'];
export const ARRAY_FIELDS = ['priorGrants', 'uninsulatedParts'];

export const ALLOWED_VALUES = {
  priorGrants: ['insulation', 'heatPump', 'none'],
  propertyType: ['detached', 'semiDetached', 'terraced', 'flat', 'bungalow'],
  ownership: ['ownOutright', 'mortgage', 'sharedOwnership', 'rent'],
  consent: ['yes', 'no'],
  incomeBand: ['under12570', '12571to50270', '50271to125140', 'over125141'],
  uninsulatedParts: ['loft', 'walls', 'floor', 'allInsulated', 'notSure'],
  heating: ['gasBoiler', 'oilBoiler', 'electric', 'heatPump', 'other'],
};

// V1: Validate single value against allowed list
export function validateValue(field, value) {
  if (typeof value !== 'string') return false;
  if (value === '') return true; // unanswered is valid
  const allowed = ALLOWED_VALUES[field];
  return Boolean(allowed && allowed.includes(value));
}

// V2: Validate array contains only allowed values with no duplicates
export function validateArray(field, values) {
  if (!Array.isArray(values)) return false;
  const allowed = ALLOWED_VALUES[field];
  if (!allowed) return false;
  const seen = new Set();
  for (const val of values) {
    if (!allowed.includes(val) || seen.has(val)) return false;
    seen.add(val);
  }
  return true;
}

// V3: Enforce exclusive options
export function isExclusive(field, values) {
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
export function needsConsent(ownership) {
  return ownership === 'sharedOwnership' || ownership === 'rent';
}

// Apply V1-V4 rules when setting an answer. Returns the original object
// unchanged when the new value is not valid.
export function setAnswer(answers, field, value) {
  const updated = { ...answers };

  if (ARRAY_FIELDS.includes(field)) {
    if (!validateArray(field, value)) return answers;
    if (!isExclusive(field, value)) return answers;
    updated[field] = value;
    return updated;
  }

  if (!validateValue(field, value)) return answers;

  // V4: Consent can only be given when the ownership type asks for it
  if (field === 'consent' && value !== '' && !needsConsent(answers.ownership)) return answers;

  updated[field] = value;

  // V4: Clear consent whenever ownership changes - rent and shared ownership
  // ask different consent questions, so an earlier answer does not carry over
  if (field === 'ownership' && value !== answers.ownership) {
    updated.consent = '';
  }

  return updated;
}

export function isAnswered(field, value) {
  if (Array.isArray(value)) return value.length > 0;
  return typeof value === 'string' && value !== '';
}
