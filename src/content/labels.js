// Display labels for all form values

export const labels = {
  propertyType: {
    detached: 'Detached',
    semiDetached: 'Semi-detached',
    terraced: 'Terraced',
    flat: 'Flat',
    bungalow: 'Bungalow',
  },
  ownership: {
    ownOutright: 'Own outright',
    mortgage: 'Mortgage',
    sharedOwnership: 'Shared ownership',
    rent: 'Rent',
  },
  consent: {
    yes: 'Yes',
    no: 'No',
  },
  incomeBand: {
    under12570: 'Under £12,570',
    '12571to50270': '£12,571 to £50,270',
    '50271to125140': '£50,271 to £125,140',
    over125141: '£125,141 or more',
  },
  uninsulatedParts: {
    loft: 'Loft or roof',
    walls: 'Walls',
    floor: 'Floor',
    allInsulated: 'All parts are insulated',
    notSure: "I'm not sure",
  },
  heating: {
    gasBoiler: 'Gas boiler',
    oilBoiler: 'Oil boiler',
    electric: 'Electric heating',
    heatPump: 'Heat pump',
    other: 'Other',
  },
  priorGrants: {
    insulation: 'Insulation grant',
    heatPump: 'Heat pump grant',
    none: 'No, I have not received a Green Home Grant',
  },
};

// Reason codes to display text
export const reasonTexts = {
  ALREADY_RECEIVED: 'You have already received this grant. You can only get one grant of each type.',
  NO_CONSENT: 'You need permission before you can apply.',
  ALREADY_INSULATED: 'You told us all parts of your property are insulated.',
  ALREADY_HAS_HEAT_PUMP: 'Your property already has a heat pump.',
};

// For shared ownership vs rent, NO_CONSENT has different wording
export function getReasonText(reason, ownership) {
  if (reason === 'NO_CONSENT') {
    if (ownership === 'sharedOwnership') {
      return 'All owners of the property must agree to the work before you can apply.';
    }
    if (ownership === 'rent') {
      return "You need your landlord's permission before you can apply.";
    }
  }
  return reasonTexts[reason] || '';
}

// Get label for a value
export function getLabel(field, value) {
  if (labels[field]) {
    return labels[field][value];
  }
  return value;
}
