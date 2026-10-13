import { describe, it, expect } from 'vitest';
import { emptyAnswers, setAnswer, isValidAnswers, isValidFieldValue, requiredFields } from './answers';

describe('setAnswer', () => {
  it('AC4.2 changing ownership to own outright or mortgage clears consent (V4)', () => {
    ['ownOutright', 'mortgage'].forEach((ownership) => {
      const before = { ...emptyAnswers, ownership: 'rent', consent: 'yes' };
      expect(setAnswer(before, 'ownership', ownership).consent).toBe('');
    });
  });

  it('keeps consent when switching between shared ownership and rent', () => {
    const before = { ...emptyAnswers, ownership: 'rent', consent: 'yes' };
    expect(setAnswer(before, 'ownership', 'sharedOwnership').consent).toBe('yes');
  });

  it('AC4a.3 adding a grant type to prior grants clears the matching answer (V6)', () => {
    const before = { ...emptyAnswers, priorGrants: ['none'], uninsulatedParts: ['loft'], heating: 'gasBoiler' };
    const insulation = setAnswer(before, 'priorGrants', ['insulation']);
    expect(insulation.uninsulatedParts).toEqual([]);
    expect(insulation.heating).toBe('gasBoiler');
    const heatPump = setAnswer(before, 'priorGrants', ['heatPump']);
    expect(heatPump.heating).toBe('');
    expect(heatPump.uninsulatedParts).toEqual(['loft']);
  });

  it('does not change the original object', () => {
    const before = { ...emptyAnswers };
    setAnswer(before, 'propertyType', 'flat');
    expect(before.propertyType).toBe('');
  });
});

describe('validation (V1–V6)', () => {
  it('V1 rejects unknown single values', () => {
    expect(isValidFieldValue('propertyType', 'castle')).toBe(false);
    expect(isValidFieldValue('propertyType', '')).toBe(true);
  });

  it('V2 rejects duplicates and unknown values in lists', () => {
    expect(isValidFieldValue('uninsulatedParts', ['loft', 'loft'])).toBe(false);
    expect(isValidFieldValue('uninsulatedParts', ['garage'])).toBe(false);
    expect(isValidFieldValue('uninsulatedParts', 'loft')).toBe(false);
  });

  it('V3 rejects exclusive options ticked with others', () => {
    expect(isValidFieldValue('priorGrants', ['none', 'insulation'])).toBe(false);
    expect(isValidFieldValue('uninsulatedParts', ['notSure', 'loft'])).toBe(false);
    expect(isValidFieldValue('uninsulatedParts', ['allInsulated', 'notSure'])).toBe(false);
    expect(isValidFieldValue('uninsulatedParts', ['loft', 'walls'])).toBe(true);
  });

  it('V4 rejects consent when it is not needed', () => {
    expect(isValidAnswers({ ...emptyAnswers, ownership: 'mortgage', consent: 'yes' })).toBe(false);
  });

  it('V6 rejects answers to skipped questions', () => {
    expect(isValidAnswers({ ...emptyAnswers, priorGrants: ['insulation'], uninsulatedParts: ['loft'] })).toBe(false);
    expect(isValidAnswers({ ...emptyAnswers, priorGrants: ['heatPump'], heating: 'other' })).toBe(false);
  });

  it('rejects things that are not answer objects', () => {
    expect(isValidAnswers(null)).toBe(false);
    expect(isValidAnswers([])).toBe(false);
    expect(isValidAnswers({ priorGrants: [] })).toBe(false);
    expect(isValidAnswers(emptyAnswers)).toBe(true);
  });
});

describe('requiredFields', () => {
  it('lists only prior grants on the early-exit path', () => {
    expect(requiredFields({ ...emptyAnswers, priorGrants: ['insulation', 'heatPump'] })).toEqual(['priorGrants']);
  });

  it('includes consent only for shared ownership or rent', () => {
    expect(requiredFields({ ...emptyAnswers, ownership: 'rent' })).toContain('consent');
    expect(requiredFields({ ...emptyAnswers, ownership: 'mortgage' })).not.toContain('consent');
  });
});
