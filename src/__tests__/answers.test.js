import { describe, it, expect } from 'vitest';
import { emptyAnswers, setAnswer, isAnswered } from '../state/answers.js';

describe('answers.js', () => {
  describe('emptyAnswers', () => {
    it('has all required fields initialized', () => {
      expect(emptyAnswers).toEqual({
        priorGrants: [],
        propertyType: '',
        ownership: '',
        consent: '',
        incomeBand: '',
        uninsulatedParts: [],
        heating: '',
      });
    });
  });

  describe('setAnswer - V1: String field validation', () => {
    it('sets a valid string value', () => {
      const updated = setAnswer(emptyAnswers, 'propertyType', 'detached');
      expect(updated.propertyType).toBe('detached');
    });

    it('sets empty string (unanswered)', () => {
      const answers = setAnswer(emptyAnswers, 'propertyType', 'detached');
      const cleared = setAnswer(answers, 'propertyType', '');
      expect(cleared.propertyType).toBe('');
    });

    it('ignores invalid string value', () => {
      const updated = setAnswer(emptyAnswers, 'propertyType', 'invalidType');
      expect(updated.propertyType).toBe('');
    });

    it('ignores non-string value', () => {
      const updated = setAnswer(emptyAnswers, 'propertyType', 123);
      expect(updated.propertyType).toBe('');
    });
  });

  describe('setAnswer - V2: Array field validation', () => {
    it('sets a valid array value', () => {
      const updated = setAnswer(emptyAnswers, 'uninsulatedParts', ['loft', 'walls']);
      expect(updated.uninsulatedParts).toEqual(['loft', 'walls']);
    });

    it('ignores invalid value in array', () => {
      const updated = setAnswer(emptyAnswers, 'uninsulatedParts', ['loft', 'invalid']);
      expect(updated.uninsulatedParts).toEqual([]);
    });

    it('ignores duplicate values', () => {
      const updated = setAnswer(emptyAnswers, 'uninsulatedParts', ['loft', 'loft']);
      expect(updated.uninsulatedParts).toEqual([]);
    });

    it('ignores non-array value', () => {
      const updated = setAnswer(emptyAnswers, 'uninsulatedParts', 'loft');
      expect(updated.uninsulatedParts).toEqual([]);
    });
  });

  describe('setAnswer - V3: Exclusive options', () => {
    describe('priorGrants exclusive "none"', () => {
      it('sets "none" alone', () => {
        const updated = setAnswer(emptyAnswers, 'priorGrants', ['none']);
        expect(updated.priorGrants).toEqual(['none']);
      });

      it('ignores "none" with other values', () => {
        const updated = setAnswer(emptyAnswers, 'priorGrants', ['none', 'insulation']);
        expect(updated.priorGrants).toEqual([]);
      });
    });

    describe('uninsulatedParts exclusive options', () => {
      it('sets "allInsulated" alone', () => {
        const updated = setAnswer(emptyAnswers, 'uninsulatedParts', ['allInsulated']);
        expect(updated.uninsulatedParts).toEqual(['allInsulated']);
      });

      it('sets "notSure" alone', () => {
        const updated = setAnswer(emptyAnswers, 'uninsulatedParts', ['notSure']);
        expect(updated.uninsulatedParts).toEqual(['notSure']);
      });

      it('ignores "allInsulated" with other values', () => {
        const updated = setAnswer(emptyAnswers, 'uninsulatedParts', ['allInsulated', 'loft']);
        expect(updated.uninsulatedParts).toEqual([]);
      });

      it('allows "notSure" mixed with specific parts (Q5a)', () => {
        // Q5a: notSure can be combined with specific parts
        const updated = setAnswer(emptyAnswers, 'uninsulatedParts', ['notSure', 'loft']);
        expect(updated.uninsulatedParts).toEqual(['notSure', 'loft']);
      });

      it('allows loft/walls/floor in any combination', () => {
        const updated = setAnswer(emptyAnswers, 'uninsulatedParts', ['loft', 'floor']);
        expect(updated.uninsulatedParts).toEqual(['loft', 'floor']);
      });
    });
  });

  describe('setAnswer - V4: Dependent field clearing', () => {
    it('clears consent when ownership changes to ownOutright', () => {
      let answers = setAnswer(emptyAnswers, 'ownership', 'sharedOwnership');
      answers = setAnswer(answers, 'consent', 'yes');
      expect(answers.consent).toBe('yes');

      answers = setAnswer(answers, 'ownership', 'ownOutright');
      expect(answers.ownership).toBe('ownOutright');
      expect(answers.consent).toBe('');
    });

    it('clears consent when ownership changes to mortgage', () => {
      let answers = setAnswer(emptyAnswers, 'ownership', 'rent');
      answers = setAnswer(answers, 'consent', 'yes');
      expect(answers.consent).toBe('yes');

      answers = setAnswer(answers, 'ownership', 'mortgage');
      expect(answers.ownership).toBe('mortgage');
      expect(answers.consent).toBe('');
    });

    it('keeps consent when ownership stays as sharedOwnership', () => {
      let answers = setAnswer(emptyAnswers, 'ownership', 'sharedOwnership');
      answers = setAnswer(answers, 'consent', 'yes');
      answers = setAnswer(answers, 'ownership', 'sharedOwnership');
      expect(answers.consent).toBe('yes');
    });

    it('keeps consent when ownership changes to rent', () => {
      let answers = setAnswer(emptyAnswers, 'ownership', 'sharedOwnership');
      answers = setAnswer(answers, 'consent', 'yes');
      answers = setAnswer(answers, 'ownership', 'rent');
      expect(answers.consent).toBe('yes');
    });
  });

  describe('isAnswered', () => {
    it('returns false for empty string', () => {
      expect(isAnswered('propertyType', '')).toBe(false);
    });

    it('returns true for non-empty string', () => {
      expect(isAnswered('propertyType', 'detached')).toBe(true);
    });

    it('returns false for empty array', () => {
      expect(isAnswered('uninsulatedParts', [])).toBe(false);
    });

    it('returns true for non-empty array', () => {
      expect(isAnswered('uninsulatedParts', ['loft'])).toBe(true);
    });
  });

  describe('setAnswer - all fields', () => {
    it('validates all string fields', () => {
      const stringFields = ['propertyType', 'ownership', 'consent', 'incomeBand', 'heating'];
      const testValues = {
        propertyType: 'detached',
        ownership: 'ownOutright',
        consent: 'yes',
        incomeBand: 'under12570',
        heating: 'gasBoiler',
      };

      for (const field of stringFields) {
        const updated = setAnswer(emptyAnswers, field, testValues[field]);
        expect(updated[field]).toBe(testValues[field]);
      }
    });

    it('validates all array fields', () => {
      const arrayFields = ['priorGrants', 'uninsulatedParts'];
      const testValues = {
        priorGrants: ['insulation'],
        uninsulatedParts: ['loft', 'walls'],
      };

      for (const field of arrayFields) {
        const updated = setAnswer(emptyAnswers, field, testValues[field]);
        expect(updated[field]).toEqual(testValues[field]);
      }
    });
  });
});
