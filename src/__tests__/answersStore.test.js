import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { load, save } from '../state/answersStore.js';
import { emptyAnswers } from '../state/answers.js';

describe('answersStore.js', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  describe('load', () => {
    it('returns emptyAnswers when storage is empty', () => {
      const result = load();
      expect(result).toEqual(emptyAnswers);
    });

    it('loads valid stored answers', () => {
      const answers = {
        ...emptyAnswers,
        propertyType: 'detached',
        ownership: 'ownOutright',
      };
      sessionStorage.setItem('ghg-checker:v1', JSON.stringify({
        version: 1,
        answers,
      }));

      const result = load();
      expect(result.propertyType).toBe('detached');
      expect(result.ownership).toBe('ownOutright');
    });

    it('returns emptyAnswers for invalid JSON', () => {
      sessionStorage.setItem('ghg-checker:v1', 'invalid json{');
      const result = load();
      expect(result).toEqual(emptyAnswers);
    });

    it('returns emptyAnswers for wrong version', () => {
      sessionStorage.setItem('ghg-checker:v1', JSON.stringify({
        version: 2,
        answers: emptyAnswers,
      }));
      const result = load();
      expect(result).toEqual(emptyAnswers);
    });

    it('returns emptyAnswers when version is missing', () => {
      sessionStorage.setItem('ghg-checker:v1', JSON.stringify({
        answers: emptyAnswers,
      }));
      const result = load();
      expect(result).toEqual(emptyAnswers);
    });

    it('returns emptyAnswers when answers field is missing', () => {
      sessionStorage.setItem('ghg-checker:v1', JSON.stringify({
        version: 1,
      }));
      const result = load();
      expect(result).toEqual(emptyAnswers);
    });

    it('rejects invalid string values', () => {
      sessionStorage.setItem('ghg-checker:v1', JSON.stringify({
        version: 1,
        answers: {
          ...emptyAnswers,
          propertyType: 'invalidType',
        },
      }));
      const result = load();
      expect(result).toEqual(emptyAnswers);
    });

    it('rejects invalid array values', () => {
      sessionStorage.setItem('ghg-checker:v1', JSON.stringify({
        version: 1,
        answers: {
          ...emptyAnswers,
          uninsulatedParts: ['loft', 'invalid'],
        },
      }));
      const result = load();
      expect(result).toEqual(emptyAnswers);
    });

    it('rejects duplicate array values', () => {
      sessionStorage.setItem('ghg-checker:v1', JSON.stringify({
        version: 1,
        answers: {
          ...emptyAnswers,
          uninsulatedParts: ['loft', 'loft'],
        },
      }));
      const result = load();
      expect(result).toEqual(emptyAnswers);
    });

    it('rejects priorGrants with "none" and other values (V3)', () => {
      sessionStorage.setItem('ghg-checker:v1', JSON.stringify({
        version: 1,
        answers: {
          ...emptyAnswers,
          priorGrants: ['none', 'insulation'],
        },
      }));
      const result = load();
      expect(result).toEqual(emptyAnswers);
    });

    it('rejects uninsulatedParts with "allInsulated" and others (V3)', () => {
      sessionStorage.setItem('ghg-checker:v1', JSON.stringify({
        version: 1,
        answers: {
          ...emptyAnswers,
          uninsulatedParts: ['allInsulated', 'loft'],
        },
      }));
      const result = load();
      expect(result).toEqual(emptyAnswers);
    });

    it('rejects uninsulatedParts with "notSure" and others (V3)', () => {
      sessionStorage.setItem('ghg-checker:v1', JSON.stringify({
        version: 1,
        answers: {
          ...emptyAnswers,
          uninsulatedParts: ['notSure', 'loft'],
        },
      }));
      const result = load();
      expect(result).toEqual(emptyAnswers);
    });

    it('rejects consent when ownership does not require it (V4)', () => {
      sessionStorage.setItem('ghg-checker:v1', JSON.stringify({
        version: 1,
        answers: {
          ...emptyAnswers,
          ownership: 'ownOutright',
          consent: 'yes',
        },
      }));
      const result = load();
      expect(result).toEqual(emptyAnswers);
    });

    it('handles sessionStorage.getItem throwing', () => {
      const original = sessionStorage.getItem;
      sessionStorage.getItem = vi.fn(() => {
        throw new Error('Storage unavailable');
      });

      const result = load();
      expect(result).toEqual(emptyAnswers);

      sessionStorage.getItem = original;
    });

    it('merges loaded answers with emptyAnswers to ensure all fields exist', () => {
      sessionStorage.setItem('ghg-checker:v1', JSON.stringify({
        version: 1,
        answers: {
          propertyType: 'detached',
        },
      }));

      const result = load();
      expect(result).toHaveProperty('propertyType');
      expect(result).toHaveProperty('ownership');
      expect(result).toHaveProperty('consent');
      expect(result).toHaveProperty('heating');
      expect(result.propertyType).toBe('detached');
      expect(result.ownership).toBe('');
    });
  });

  describe('save', () => {
    it('saves answers to sessionStorage', () => {
      const answers = {
        ...emptyAnswers,
        propertyType: 'detached',
      };

      save(answers);

      const stored = sessionStorage.getItem('ghg-checker:v1');
      const parsed = JSON.parse(stored);
      expect(parsed.version).toBe(1);
      expect(parsed.answers.propertyType).toBe('detached');
    });

    it('saves with correct version', () => {
      save(emptyAnswers);

      const stored = JSON.parse(sessionStorage.getItem('ghg-checker:v1'));
      expect(stored.version).toBe(1);
    });

    it('handles sessionStorage.setItem throwing', () => {
      const original = sessionStorage.setItem;
      sessionStorage.setItem = vi.fn(() => {
        throw new Error('Storage full');
      });

      // Should not throw
      expect(() => save(emptyAnswers)).not.toThrow();

      sessionStorage.setItem = original;
    });
  });

  describe('round-trip', () => {
    it('saves and loads intact', () => {
      const original = {
        ...emptyAnswers,
        priorGrants: ['insulation'],
        propertyType: 'flat',
        ownership: 'rent',
        consent: 'yes',
        incomeBand: '12571to50270',
        uninsulatedParts: ['loft', 'walls'],
        heating: 'gasBoiler',
      };

      save(original);
      const loaded = load();

      expect(loaded).toEqual(original);
    });
  });
});
