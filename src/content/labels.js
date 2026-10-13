// Display labels for all form values, in English and Welsh
// The Welsh is a draft and must be checked by a Welsh language translator before release

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
    under12570: '£12,570 or less',
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

export const welshLabels = {
  propertyType: {
    detached: 'Tŷ ar wahân',
    semiDetached: 'Tŷ pâr',
    terraced: 'Tŷ teras',
    flat: 'Fflat',
    bungalow: 'Byngalo',
  },
  ownership: {
    ownOutright: 'Yn berchen arno’n llwyr',
    mortgage: 'Morgais',
    sharedOwnership: 'Rhanberchnogaeth',
    rent: 'Rhentu',
  },
  consent: {
    yes: 'Oes',
    no: 'Nac oes',
  },
  incomeBand: {
    under12570: '£12,570 neu lai',
    '12571to50270': '£12,571 i £50,270',
    '50271to125140': '£50,271 i £125,140',
    over125141: '£125,141 neu fwy',
  },
  uninsulatedParts: {
    loft: 'Llofft neu do',
    walls: 'Waliau',
    floor: 'Llawr',
    allInsulated: 'Mae pob rhan wedi’i hinswleiddio',
    notSure: 'Nid wyf yn siŵr',
  },
  heating: {
    gasBoiler: 'Boeler nwy',
    oilBoiler: 'Boeler olew',
    electric: 'Gwresogi trydan',
    heatPump: 'Pwmp gwres',
    other: 'Arall',
  },
  priorGrants: {
    insulation: 'Grant inswleiddio',
    heatPump: 'Grant pwmp gwres',
    none: 'Nac ydw, nid wyf wedi cael Grant Cartref Gwyrdd',
  },
};

const LABELS = { en: labels, cy: welshLabels };

// Reason codes to display text
export const reasonTexts = {
  ALREADY_RECEIVED: 'You have already received this grant. You can only get one grant of each type.',
  NO_CONSENT: 'You need permission before you can apply.',
  ALREADY_INSULATED: 'You told us all parts of your property are insulated.',
  ALREADY_HAS_HEAT_PUMP: 'Your property already has a heat pump.',
  NO_CONSENT_SHARED: 'All owners of the property must agree to the work before you can apply.',
  NO_CONSENT_RENT: "You need your landlord's permission before you can apply.",
};

export const welshReasonTexts = {
  ALREADY_RECEIVED: 'Rydych eisoes wedi cael y grant hwn. Dim ond un grant o bob math y gallwch ei gael.',
  NO_CONSENT: 'Mae angen caniatâd arnoch cyn y gallwch wneud cais.',
  ALREADY_INSULATED: 'Rydych wedi dweud wrthym fod pob rhan o’ch eiddo wedi’i hinswleiddio.',
  ALREADY_HAS_HEAT_PUMP: 'Mae gan eich eiddo bwmp gwres yn barod.',
  NO_CONSENT_SHARED: 'Rhaid i holl berchnogion yr eiddo gytuno i’r gwaith cyn y gallwch wneud cais.',
  NO_CONSENT_RENT: 'Mae angen caniatâd eich landlord arnoch cyn y gallwch wneud cais.',
};

const REASON_TEXTS = { en: reasonTexts, cy: welshReasonTexts };

// For shared ownership vs rent, NO_CONSENT has different wording
export function getReasonText(reason, ownership, lang = 'en') {
  const texts = REASON_TEXTS[lang] || reasonTexts;
  if (reason === 'NO_CONSENT') {
    if (ownership === 'sharedOwnership') return texts.NO_CONSENT_SHARED;
    if (ownership === 'rent') return texts.NO_CONSENT_RENT;
  }
  return texts[reason] || '';
}

// Get label for a value
export function getLabel(field, value, lang = 'en') {
  const fieldLabels = (LABELS[lang] || labels)[field];
  if (fieldLabels) {
    return fieldLabels[value];
  }
  return value;
}
