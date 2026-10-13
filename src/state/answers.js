// The Answers model and its structural rules (spec §3.1, V1–V6).
import { OPTIONS_BY_FIELD } from '../content/labels';

export const emptyAnswers = Object.freeze({
  priorGrants: [],
  propertyType: '',
  ownership: '',
  consent: '',
  incomeBand: '',
  uninsulatedParts: [],
  heating: '',
});

export const FIELDS = Object.keys(emptyAnswers);

const ARRAY_FIELDS = ['priorGrants', 'uninsulatedParts'];

// Options that must be the only one ticked (V3).
export const EXCLUSIVE_VALUES = {
  priorGrants: ['none'],
  uninsulatedParts: ['allInsulated', 'notSure'],
};

const allowedValues = (field) => OPTIONS_BY_FIELD[field].map((o) => o.value);

export function isArrayField(field) {
  return ARRAY_FIELDS.includes(field);
}

// V5
export function isAnswered(value) {
  return Array.isArray(value) ? value.length > 0 : value !== '';
}

export function hasReceived(answers, grantType) {
  return answers.priorGrants.includes(grantType);
}

export function isEarlyExit(answers) {
  return hasReceived(answers, 'insulation') && hasReceived(answers, 'heatPump');
}

export function isConsentRequired(answers) {
  return answers.ownership === 'sharedOwnership' || answers.ownership === 'rent';
}

// Q1: a question is skipped when the user already had that grant type.
export function isInsulationAsked(answers) {
  return !hasReceived(answers, 'insulation');
}

export function isHeatingAsked(answers) {
  return !hasReceived(answers, 'heatPump');
}

// Fields the user must answer, in journey order.
export function requiredFields(answers) {
  if (isEarlyExit(answers)) return ['priorGrants'];
  const fields = ['priorGrants', 'propertyType', 'ownership'];
  if (isConsentRequired(answers)) fields.push('consent');
  fields.push('incomeBand');
  if (isInsulationAsked(answers)) fields.push('uninsulatedParts');
  if (isHeatingAsked(answers)) fields.push('heating');
  return fields;
}

// Sets one answer and clears answers that no longer apply (V4, V6).
export function setAnswer(answers, field, value) {
  const next = { ...answers, [field]: value };
  if (!isConsentRequired(next)) next.consent = '';
  if (!isInsulationAsked(next)) next.uninsulatedParts = [];
  if (!isHeatingAsked(next)) next.heating = '';
  return next;
}

// V1–V3 for a single field.
export function isValidFieldValue(field, value) {
  const allowed = allowedValues(field);
  if (isArrayField(field)) {
    if (!Array.isArray(value)) return false;
    if (new Set(value).size !== value.length) return false;
    if (!value.every((v) => allowed.includes(v))) return false;
    const exclusive = EXCLUSIVE_VALUES[field] || [];
    if (value.some((v) => exclusive.includes(v)) && value.length > 1) return false;
    return true;
  }
  return value === '' || allowed.includes(value);
}

// V1–V6 for a whole Answers object (used when reading storage).
export function isValidAnswers(answers) {
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) return false;
  if (!FIELDS.every((f) => isValidFieldValue(f, answers[f]))) return false;
  if (!isConsentRequired(answers) && answers.consent !== '') return false;
  if (!isInsulationAsked(answers) && answers.uninsulatedParts.length > 0) return false;
  if (!isHeatingAsked(answers) && answers.heating !== '') return false;
  return true;
}
