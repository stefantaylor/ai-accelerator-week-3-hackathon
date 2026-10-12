import { describe, it, expect } from 'vitest';
import { assessEligibility } from '../eligibility/assessEligibility.js';
import { emptyAnswers } from '../state/answers.js';

describe('assessEligibility', () => {
  describe('G1: Eligibility outcome per grant type', () => {
    describe('AC1.1: propertyType never affects outcome', () => {
      it('returns same result for different property types', () => {
        const baseAnswers = {
          ...emptyAnswers,
          ownership: 'ownOutright',
          consent: 'yes',
          incomeBand: 'under12570',
          uninsulatedParts: ['loft'],
          heating: 'gasBoiler',
        };

        const result1 = assessEligibility({ ...baseAnswers, propertyType: 'detached' });
        const result2 = assessEligibility({ ...baseAnswers, propertyType: 'flat' });

        expect(result1.insulation).toEqual(result2.insulation);
        expect(result1.heatPump).toEqual(result2.heatPump);
      });
    });

    describe('AC1.2: priorGrants="insulation" makes insulation ineligible', () => {
      it('insulation ineligible with ALREADY_RECEIVED', () => {
        const answers = {
          ...emptyAnswers,
          priorGrants: ['insulation'],
          uninsulatedParts: ['loft'],
          heating: 'gasBoiler',
        };

        const result = assessEligibility(answers);
        expect(result.insulation.eligible).toBe(false);
        expect(result.insulation.reason).toBe('ALREADY_RECEIVED');
      });

      it('heat pump still eligible', () => {
        const answers = {
          ...emptyAnswers,
          priorGrants: ['insulation'],
          uninsulatedParts: ['loft'],
          heating: 'gasBoiler',
        };

        const result = assessEligibility(answers);
        expect(result.heatPump.eligible).toBe(true);
        expect(result.heatPump.reason).toBe(null);
      });
    });

    describe('AC1.3: priorGrants="heatPump" makes heat pump ineligible', () => {
      it('heat pump ineligible with ALREADY_RECEIVED', () => {
        const answers = {
          ...emptyAnswers,
          priorGrants: ['heatPump'],
          uninsulatedParts: ['loft'],
          heating: 'gasBoiler',
        };

        const result = assessEligibility(answers);
        expect(result.heatPump.eligible).toBe(false);
        expect(result.heatPump.reason).toBe('ALREADY_RECEIVED');
      });

      it('insulation still eligible', () => {
        const answers = {
          ...emptyAnswers,
          priorGrants: ['heatPump'],
          uninsulatedParts: ['loft'],
          heating: 'gasBoiler',
        };

        const result = assessEligibility(answers);
        expect(result.insulation.eligible).toBe(true);
      });
    });

    describe('AC1.4: uninsulatedParts covered in PARTS order', () => {
      it('returns parts in loft/walls/floor order', () => {
        const answers = {
          ...emptyAnswers,
          uninsulatedParts: ['floor', 'loft'],
          heating: 'gasBoiler',
        };

        const result = assessEligibility(answers);
        expect(result.insulation.eligible).toBe(true);
        expect(result.insulation.coveredParts).toEqual(['loft', 'floor']);
      });
    });

    describe('AC1.5: uninsulatedParts="notSure" gives needsAssessment', () => {
      it('returns needsAssessment true and no coveredParts', () => {
        const answers = {
          ...emptyAnswers,
          uninsulatedParts: ['notSure'],
          heating: 'gasBoiler',
        };

        const result = assessEligibility(answers);
        expect(result.insulation.eligible).toBe(true);
        expect(result.insulation.needsAssessment).toBe(true);
        expect(result.insulation.coveredParts).toBeUndefined();
      });
    });

    describe('AC1.6: uninsulatedParts="allInsulated" makes ineligible', () => {
      it('insulation ineligible with ALREADY_INSULATED', () => {
        const answers = {
          ...emptyAnswers,
          uninsulatedParts: ['allInsulated'],
          heating: 'gasBoiler',
        };

        const result = assessEligibility(answers);
        expect(result.insulation.eligible).toBe(false);
        expect(result.insulation.reason).toBe('ALREADY_INSULATED');
      });
    });

    describe('AC1.7: heating="heatPump" makes heat pump ineligible', () => {
      it('heat pump ineligible with ALREADY_HAS_HEAT_PUMP', () => {
        const answers = {
          ...emptyAnswers,
          uninsulatedParts: ['loft'],
          heating: 'heatPump',
        };

        const result = assessEligibility(answers);
        expect(result.heatPump.eligible).toBe(false);
        expect(result.heatPump.reason).toBe('ALREADY_HAS_HEAT_PUMP');
      });

      it('all other heating values make heat pump eligible', () => {
        const heatingTypes = ['gasBoiler', 'oilBoiler', 'electric', 'other'];
        for (const heating of heatingTypes) {
          const answers = {
            ...emptyAnswers,
            uninsulatedParts: ['loft'],
            heating,
          };

          const result = assessEligibility(answers);
          expect(result.heatPump.eligible).toBe(true);
          expect(result.heatPump.reason).toBe(null);
        }
      });
    });

    describe('AC1.8: ownOutright/mortgage ignore consent', () => {
      it('ignores consent for ownOutright', () => {
        const answers = {
          ...emptyAnswers,
          ownership: 'ownOutright',
          consent: 'no',
          uninsulatedParts: ['loft'],
          heating: 'gasBoiler',
        };

        const result = assessEligibility(answers);
        expect(result.insulation.eligible).toBe(true);
        expect(result.heatPump.eligible).toBe(true);
      });

      it('ignores consent for mortgage', () => {
        const answers = {
          ...emptyAnswers,
          ownership: 'mortgage',
          consent: 'no',
          uninsulatedParts: ['loft'],
          heating: 'gasBoiler',
        };

        const result = assessEligibility(answers);
        expect(result.insulation.eligible).toBe(true);
        expect(result.heatPump.eligible).toBe(true);
      });
    });

    describe('AC1.9: sharedOwnership/rent with consent=no makes both ineligible', () => {
      it('shared ownership consent=no', () => {
        const answers = {
          ...emptyAnswers,
          ownership: 'sharedOwnership',
          consent: 'no',
          uninsulatedParts: ['loft'],
          heating: 'gasBoiler',
        };

        const result = assessEligibility(answers);
        expect(result.insulation.eligible).toBe(false);
        expect(result.insulation.reason).toBe('NO_CONSENT');
        expect(result.heatPump.eligible).toBe(false);
        expect(result.heatPump.reason).toBe('NO_CONSENT');
      });

      it('rent consent=no', () => {
        const answers = {
          ...emptyAnswers,
          ownership: 'rent',
          consent: 'no',
          uninsulatedParts: ['loft'],
          heating: 'gasBoiler',
        };

        const result = assessEligibility(answers);
        expect(result.insulation.eligible).toBe(false);
        expect(result.insulation.reason).toBe('NO_CONSENT');
        expect(result.heatPump.eligible).toBe(false);
        expect(result.heatPump.reason).toBe('NO_CONSENT');
      });
    });

    describe('AC1.10: sharedOwnership/rent with consent=yes', () => {
      it('same result as ownOutright for same other inputs', () => {
        const baseAnswers = {
          uninsulatedParts: ['loft'],
          heating: 'gasBoiler',
          incomeBand: 'under12570',
        };

        const ownOutright = assessEligibility({
          ...emptyAnswers,
          ...baseAnswers,
          ownership: 'ownOutright',
        });

        const sharedYes = assessEligibility({
          ...emptyAnswers,
          ...baseAnswers,
          ownership: 'sharedOwnership',
          consent: 'yes',
        });

        expect(ownOutright.insulation.eligible).toBe(sharedYes.insulation.eligible);
        expect(ownOutright.heatPump.eligible).toBe(sharedYes.heatPump.eligible);
      });
    });

    describe('AC1.11: overallEligible is true if at least one grant eligible', () => {
      it('true when insulation eligible', () => {
        const answers = {
          ...emptyAnswers,
          uninsulatedParts: ['loft'],
          heating: 'heatPump',
        };

        const result = assessEligibility(answers);
        expect(result.overallEligible).toBe(true);
        expect(result.insulation.eligible).toBe(true);
        expect(result.heatPump.eligible).toBe(false);
      });

      it('true when heat pump eligible', () => {
        const answers = {
          ...emptyAnswers,
          uninsulatedParts: ['allInsulated'],
          heating: 'gasBoiler',
        };

        const result = assessEligibility(answers);
        expect(result.overallEligible).toBe(true);
        expect(result.insulation.eligible).toBe(false);
        expect(result.heatPump.eligible).toBe(true);
      });

      it('true when both eligible', () => {
        const answers = {
          ...emptyAnswers,
          uninsulatedParts: ['loft'],
          heating: 'gasBoiler',
        };

        const result = assessEligibility(answers);
        expect(result.overallEligible).toBe(true);
      });

      it('false when neither eligible', () => {
        const answers = {
          ...emptyAnswers,
          priorGrants: ['insulation', 'heatPump'],
          uninsulatedParts: ['loft'],
          heating: 'gasBoiler',
        };

        const result = assessEligibility(answers);
        expect(result.overallEligible).toBe(false);
      });
    });
  });

  describe('G2: Support level by income', () => {
    describe('AC2.1: Income band mapping', () => {
      it('under12570 = 100%', () => {
        const answers = {
          ...emptyAnswers,
          incomeBand: 'under12570',
          uninsulatedParts: ['loft'],
        };

        const result = assessEligibility(answers);
        expect(result.supportPercentage).toBe(100);
      });

      it('12571to50270 = 75%', () => {
        const answers = {
          ...emptyAnswers,
          incomeBand: '12571to50270',
          uninsulatedParts: ['loft'],
        };

        const result = assessEligibility(answers);
        expect(result.supportPercentage).toBe(75);
      });

      it('50271to125140 = 50%', () => {
        const answers = {
          ...emptyAnswers,
          incomeBand: '50271to125140',
          uninsulatedParts: ['loft'],
        };

        const result = assessEligibility(answers);
        expect(result.supportPercentage).toBe(50);
      });

      it('over125141 = 25%', () => {
        const answers = {
          ...emptyAnswers,
          incomeBand: 'over125141',
          uninsulatedParts: ['loft'],
        };

        const result = assessEligibility(answers);
        expect(result.supportPercentage).toBe(25);
      });
    });

    describe('AC2.2: Income never changes eligible or reason', () => {
      it('only supportPercentage changes with income', () => {
        const baseAnswers = {
          ...emptyAnswers,
          uninsulatedParts: ['loft'],
          heating: 'gasBoiler',
        };

        const result1 = assessEligibility({ ...baseAnswers, incomeBand: 'under12570' });
        const result2 = assessEligibility({ ...baseAnswers, incomeBand: 'over125141' });

        expect(result1.insulation.eligible).toBe(result2.insulation.eligible);
        expect(result1.insulation.reason).toBe(result2.insulation.reason);
        expect(result1.heatPump.eligible).toBe(result2.heatPump.eligible);
        expect(result1.heatPump.reason).toBe(result2.heatPump.reason);
        expect(result1.supportPercentage).not.toBe(result2.supportPercentage);
      });
    });
  });

  describe('G3: Early exit for both prior grants', () => {
    describe('AC3.2: assessEligibility works with only priorGrants set', () => {
      it('returns well-formed result for early exit', () => {
        const answers = {
          ...emptyAnswers,
          priorGrants: ['insulation', 'heatPump'],
        };

        const result = assessEligibility(answers);
        expect(result).toEqual({
          overallEligible: false,
          supportPercentage: null,
          insulation: {
            eligible: false,
            reason: 'ALREADY_RECEIVED',
          },
          heatPump: {
            eligible: false,
            reason: 'ALREADY_RECEIVED',
          },
        });
      });
    });
  });

  describe('Reason precedence', () => {
    it('ALREADY_RECEIVED takes precedence over NO_CONSENT', () => {
      const answers = {
        ...emptyAnswers,
        priorGrants: ['insulation'],
        ownership: 'sharedOwnership',
        consent: 'no',
      };

      const result = assessEligibility(answers);
      expect(result.insulation.reason).toBe('ALREADY_RECEIVED');
    });

    it('ALREADY_RECEIVED takes precedence over ALREADY_INSULATED', () => {
      const answers = {
        ...emptyAnswers,
        priorGrants: ['insulation'],
        uninsulatedParts: ['allInsulated'],
      };

      const result = assessEligibility(answers);
      expect(result.insulation.reason).toBe('ALREADY_RECEIVED');
    });

    it('NO_CONSENT takes precedence over ALREADY_INSULATED', () => {
      const answers = {
        ...emptyAnswers,
        ownership: 'sharedOwnership',
        consent: 'no',
        uninsulatedParts: ['allInsulated'],
      };

      const result = assessEligibility(answers);
      expect(result.insulation.reason).toBe('NO_CONSENT');
    });
  });
});
