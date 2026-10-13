import { describe, it, expect } from 'vitest';
import { assessEligibility } from './assessEligibility';
import { emptyAnswers } from '../state/answers';
import { PROPERTY_TYPE_OPTIONS, HEATING_OPTIONS, INCOME_OPTIONS } from '../content/labels';

const base = {
  ...emptyAnswers,
  priorGrants: ['none'],
  propertyType: 'detached',
  ownership: 'ownOutright',
  consent: '',
  incomeBand: '12571to50270',
  uninsulatedParts: ['loft'],
  heating: 'gasBoiler',
};
const make = (overrides) => ({ ...base, ...overrides });

describe('assessEligibility', () => {
  it('AC1.1 property type never changes the result (all property types treated the same)', () => {
    const results = PROPERTY_TYPE_OPTIONS.map(({ value }) =>
      assessEligibility(make({ propertyType: value })),
    );
    results.forEach((r) => expect(r).toEqual(results[0]));
  });

  it('AC1.2 rule: already received an insulation grant → insulation not eligible, heat pump unaffected', () => {
    const r = assessEligibility(make({ priorGrants: ['insulation'], uninsulatedParts: [] }));
    expect(r.insulation).toEqual({ eligible: false, reason: 'ALREADY_RECEIVED' });
    expect(r.heatPump).toEqual(assessEligibility(base).heatPump);
  });

  it('AC1.3 rule: already received a heat pump grant → heat pump not eligible, insulation unaffected', () => {
    const r = assessEligibility(make({ priorGrants: ['heatPump'], heating: '' }));
    expect(r.heatPump).toEqual({ eligible: false, reason: 'ALREADY_RECEIVED' });
    expect(r.insulation).toEqual(assessEligibility(base).insulation);
  });

  it('AC1.4 rule: otherwise insulation eligible, covering the parts ticked (in PARTS order)', () => {
    const r = assessEligibility(make({ uninsulatedParts: ['floor', 'loft'] }));
    expect(r.insulation).toEqual({ eligible: true, reason: null, coveredParts: ['loft', 'floor'] });
  });

  it('AC1.5 rule: "I\'m not sure" → may be eligible, assessor checks', () => {
    const r = assessEligibility(make({ uninsulatedParts: ['notSure'] }));
    expect(r.insulation).toEqual({ eligible: true, reason: null, needsAssessment: true });
    expect(r.insulation.coveredParts).toBeUndefined();
  });

  it('AC1.6 rule: all parts insulated → insulation not eligible', () => {
    const r = assessEligibility(make({ uninsulatedParts: ['allInsulated'] }));
    expect(r.insulation).toEqual({ eligible: false, reason: 'ALREADY_INSULATED' });
  });

  it('AC1.7 rule: current heating is a heat pump → heat pump not eligible; any other heating eligible', () => {
    HEATING_OPTIONS.forEach(({ value }) => {
      const r = assessEligibility(make({ heating: value }));
      if (value === 'heatPump') {
        expect(r.heatPump).toEqual({ eligible: false, reason: 'ALREADY_HAS_HEAT_PUMP' });
      } else {
        expect(r.heatPump).toEqual({ eligible: true, reason: null });
      }
    });
  });

  it('AC1.8 consent is never considered for owners (outright or mortgage)', () => {
    ['ownOutright', 'mortgage'].forEach((ownership) => {
      const r = assessEligibility(make({ ownership, consent: 'no' }));
      expect(r.insulation.eligible).toBe(true);
      expect(r.heatPump.eligible).toBe(true);
    });
  });

  it('AC1.9 rule (blocker): shared ownership or rent with consent = No → neither grant', () => {
    ['sharedOwnership', 'rent'].forEach((ownership) => {
      const r = assessEligibility(make({ ownership, consent: 'no' }));
      expect(r.insulation).toEqual({ eligible: false, reason: 'NO_CONSENT' });
      expect(r.heatPump).toEqual({ eligible: false, reason: 'NO_CONSENT' });
      expect(r.overallEligible).toBe(false);
      expect(r.supportPercentage).toBeNull();
    });
  });

  it('AC1.9 ALREADY_RECEIVED takes precedence over NO_CONSENT', () => {
    const r = assessEligibility(
      make({ ownership: 'rent', consent: 'no', priorGrants: ['insulation'], uninsulatedParts: [] }),
    );
    expect(r.insulation.reason).toBe('ALREADY_RECEIVED');
    expect(r.heatPump.reason).toBe('NO_CONSENT');
  });

  it('AC1.10 consent = Yes gives the same result as owning outright', () => {
    ['sharedOwnership', 'rent'].forEach((ownership) => {
      expect(assessEligibility(make({ ownership, consent: 'yes' }))).toEqual(assessEligibility(base));
    });
  });

  it('AC1.11 overallEligible is true only if at least one grant is eligible', () => {
    expect(assessEligibility(base).overallEligible).toBe(true);
    const onlyHeatPump = assessEligibility(make({ uninsulatedParts: ['allInsulated'] }));
    expect(onlyHeatPump.overallEligible).toBe(true);
    const onlyInsulation = assessEligibility(make({ heating: 'heatPump' }));
    expect(onlyInsulation.overallEligible).toBe(true);
    const neither = assessEligibility(make({ uninsulatedParts: ['allInsulated'], heating: 'heatPump' }));
    expect(neither.overallEligible).toBe(false);
  });

  it('AC2.1 rule: income bands map to 100 / 75 / 50 / 25 per cent', () => {
    const pcts = INCOME_OPTIONS.map(({ value }) => assessEligibility(make({ incomeBand: value })).supportPercentage);
    expect(pcts).toEqual([100, 75, 50, 25]);
  });

  it('AC2.2 income never changes eligibility or reasons', () => {
    const scenarios = [
      base,
      make({ ownership: 'rent', consent: 'no' }),
      make({ uninsulatedParts: ['allInsulated'], heating: 'heatPump' }),
      make({ priorGrants: ['insulation'], uninsulatedParts: [] }),
    ];
    scenarios.forEach((s) => {
      const outcomes = INCOME_OPTIONS.map(({ value }) => {
        const r = assessEligibility({ ...s, incomeBand: value });
        return [r.insulation, r.heatPump, r.overallEligible];
      });
      outcomes.forEach((o) => expect(o).toEqual(outcomes[0]));
    });
  });

  it('AC3.2 early exit (both grants received, nothing else answered) gives a well-formed result', () => {
    const r = assessEligibility({ ...emptyAnswers, priorGrants: ['insulation', 'heatPump'] });
    expect(r).toEqual({
      overallEligible: false,
      supportPercentage: null,
      insulation: { eligible: false, reason: 'ALREADY_RECEIVED' },
      heatPump: { eligible: false, reason: 'ALREADY_RECEIVED' },
    });
  });

  it('heating never affects insulation, and uninsulated parts never affect heat pump', () => {
    expect(assessEligibility(make({ heating: 'heatPump' })).insulation).toEqual(assessEligibility(base).insulation);
    expect(assessEligibility(make({ uninsulatedParts: ['allInsulated'] })).heatPump).toEqual(
      assessEligibility(base).heatPump,
    );
  });
});
