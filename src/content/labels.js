// Display labels for every answer value (spec §3.3).
// Arrays keep the order the options appear on the page.

export const PRIOR_GRANT_OPTIONS = [
  { value: 'insulation', label: 'Insulation grant' },
  { value: 'heatPump', label: 'Heat pump grant' },
  { value: 'none', label: 'No, I have not received a Green Home Grant' },
];

export const PROPERTY_TYPE_OPTIONS = [
  { value: 'detached', label: 'Detached' },
  { value: 'semiDetached', label: 'Semi-detached' },
  { value: 'terraced', label: 'Terraced' },
  { value: 'flat', label: 'Flat' },
  { value: 'bungalow', label: 'Bungalow' },
];

export const OWNERSHIP_OPTIONS = [
  { value: 'ownOutright', label: 'Own outright' },
  { value: 'mortgage', label: 'Own with a mortgage' },
  { value: 'sharedOwnership', label: 'Shared ownership' },
  { value: 'rent', label: 'Rent' },
];

export const CONSENT_OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];

export const INCOME_OPTIONS = [
  { value: 'under12570', label: 'Under £12,570' },
  { value: '12571to50270', label: '£12,571 to £50,270' },
  { value: '50271to125140', label: '£50,271 to £125,140' },
  { value: 'over125141', label: '£125,141 or more' },
];

export const UNINSULATED_PART_OPTIONS = [
  { value: 'loft', label: 'Loft or roof' },
  { value: 'walls', label: 'Walls' },
  { value: 'floor', label: 'Floor' },
  { value: 'allInsulated', label: 'All parts are insulated' },
  { value: 'notSure', label: "I'm not sure" },
];

export const HEATING_OPTIONS = [
  { value: 'gasBoiler', label: 'Gas boiler' },
  { value: 'oilBoiler', label: 'Oil boiler' },
  { value: 'electric', label: 'Electric heating' },
  { value: 'heatPump', label: 'Heat pump' },
  { value: 'other', label: 'Other' },
];

export const OPTIONS_BY_FIELD = {
  priorGrants: PRIOR_GRANT_OPTIONS,
  propertyType: PROPERTY_TYPE_OPTIONS,
  ownership: OWNERSHIP_OPTIONS,
  consent: CONSENT_OPTIONS,
  incomeBand: INCOME_OPTIONS,
  uninsulatedParts: UNINSULATED_PART_OPTIONS,
  heating: HEATING_OPTIONS,
};

export function labelFor(field, value) {
  const option = OPTIONS_BY_FIELD[field].find((o) => o.value === value);
  return option ? option.label : value;
}
