// Eligibility assessment logic - pure function, no side effects

const SUPPORT_PERCENT = {
  under12570: 100,
  '12571to50270': 75,
  '50271to125140': 50,
  over125141: 25,
};

const PARTS_ORDER = ['loft', 'walls', 'floor'];

export function assessEligibility(answers) {
  const {
    priorGrants = [],
    ownership = '',
    consent = '',
    incomeBand = '',
    uninsulatedParts = [],
    heating = '',
  } = answers;

  // Get support percentage
  const supportPercentage = SUPPORT_PERCENT[incomeBand] ?? null;

  // Determine if consent is required
  const consentRequired = ownership === 'sharedOwnership' || ownership === 'rent';
  const consentRefused = consentRequired && consent === 'no';

  // Assess insulation grant
  const insulationEligible = !priorGrants.includes('insulation')
    && !consentRefused
    && !uninsulatedParts.includes('allInsulated')
    && uninsulatedParts.length > 0;

  let insulationReason = null;
  if (priorGrants.includes('insulation')) {
    insulationReason = 'ALREADY_RECEIVED';
  } else if (consentRefused) {
    insulationReason = 'NO_CONSENT';
  } else if (uninsulatedParts.includes('allInsulated')) {
    insulationReason = 'ALREADY_INSULATED';
  }

  const insulationResult = {
    eligible: insulationEligible,
    reason: insulationReason,
  };

  // Add covered parts or assessment flag for eligible cases
  if (insulationEligible) {
    const hasNotSure = uninsulatedParts.includes('notSure');
    const specificParts = uninsulatedParts.filter(p => PARTS_ORDER.includes(p));

    if (hasNotSure && specificParts.length > 0) {
      // Q5a: Mixed - has specific parts AND I'm not sure about others
      insulationResult.needsAssessment = true;
      insulationResult.coveredParts = specificParts.sort((a, b) => PARTS_ORDER.indexOf(a) - PARTS_ORDER.indexOf(b));
    } else if (hasNotSure) {
      // All parts are uncertain
      insulationResult.needsAssessment = true;
    } else {
      // Only specific parts ticked
      insulationResult.coveredParts = specificParts.sort((a, b) => PARTS_ORDER.indexOf(a) - PARTS_ORDER.indexOf(b));
    }
  }

  // Assess heat pump grant
  const heatPumpEligible = !priorGrants.includes('heatPump')
    && !consentRefused
    && heating !== 'heatPump';

  let heatPumpReason = null;
  if (priorGrants.includes('heatPump')) {
    heatPumpReason = 'ALREADY_RECEIVED';
  } else if (consentRefused) {
    heatPumpReason = 'NO_CONSENT';
  } else if (heating === 'heatPump') {
    heatPumpReason = 'ALREADY_HAS_HEAT_PUMP';
  }

  const heatPumpResult = {
    eligible: heatPumpEligible,
    reason: heatPumpReason,
  };

  // Overall eligibility
  const overallEligible = insulationEligible || heatPumpEligible;

  return {
    overallEligible,
    supportPercentage: overallEligible ? supportPercentage : null,
    insulation: insulationResult,
    heatPump: heatPumpResult,
  };
}
