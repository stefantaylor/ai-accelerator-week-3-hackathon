// Eligibility rules engine (spec §3.2, §4.4). Pure: no React, DOM or storage.
import { hasReceived, isConsentRequired } from '../state/answers';

export const PERCENT = {
  under12570: 100,
  '12571to50270': 75,
  '50271to125140': 50,
  over125141: 25,
};

export const PARTS = ['loft', 'walls', 'floor'];

const isOnly = (list, value) => list.length === 1 && list[0] === value;

function assessInsulation(answers, noConsent) {
  if (hasReceived(answers, 'insulation')) return { eligible: false, reason: 'ALREADY_RECEIVED' };
  if (noConsent) return { eligible: false, reason: 'NO_CONSENT' };
  const parts = answers.uninsulatedParts;
  if (isOnly(parts, 'allInsulated')) return { eligible: false, reason: 'ALREADY_INSULATED' };
  if (isOnly(parts, 'notSure')) return { eligible: true, reason: null, needsAssessment: true };
  return {
    eligible: true,
    reason: null,
    coveredParts: PARTS.filter((p) => parts.includes(p)),
  };
}

function assessHeatPump(answers, noConsent) {
  if (hasReceived(answers, 'heatPump')) return { eligible: false, reason: 'ALREADY_RECEIVED' };
  if (noConsent) return { eligible: false, reason: 'NO_CONSENT' };
  if (answers.heating === 'heatPump') return { eligible: false, reason: 'ALREADY_HAS_HEAT_PUMP' };
  return { eligible: true, reason: null };
}

export function assessEligibility(answers) {
  const noConsent = isConsentRequired(answers) && answers.consent === 'no';
  const insulation = assessInsulation(answers, noConsent);
  const heatPump = assessHeatPump(answers, noConsent);
  const overallEligible = insulation.eligible || heatPump.eligible;
  const pct = PERCENT[answers.incomeBand] ?? null;

  return {
    overallEligible,
    supportPercentage: overallEligible ? pct : null,
    insulation,
    heatPump,
  };
}
