import { describe, it, expect, vi, afterEach } from 'vitest';
import { load, save, clear, STORAGE_KEY } from './answersStore';
import { emptyAnswers } from './answers';
import { isExpired, isWarningDue, ANSWERS_TTL_MS, WARNING_AFTER_MS } from './expiry';

const NOW = 1_800_000_000_000;
const answers = { ...emptyAnswers, priorGrants: ['none'], propertyType: 'flat' };
const put = (value) => window.sessionStorage.setItem(STORAGE_KEY, typeof value === 'string' ? value : JSON.stringify(value));

afterEach(() => vi.restoreAllMocks());

describe('expiry', () => {
  it('AC5.5 answers expire at exactly 10 minutes', () => {
    expect(isExpired(NOW, NOW + ANSWERS_TTL_MS - 1)).toBe(false);
    expect(isExpired(NOW, NOW + ANSWERS_TTL_MS)).toBe(true);
    expect(isExpired(null, NOW)).toBe(false);
  });

  it('the warning is due from 8 minutes until expiry', () => {
    expect(isWarningDue(NOW, NOW + WARNING_AFTER_MS - 1)).toBe(false);
    expect(isWarningDue(NOW, NOW + WARNING_AFTER_MS)).toBe(true);
    expect(isWarningDue(NOW, NOW + ANSWERS_TTL_MS)).toBe(false);
  });
});

describe('answersStore', () => {
  it('saves and loads answers within 10 minutes', () => {
    save(answers, NOW);
    expect(load(NOW + 60_000)).toEqual({ answers, savedAt: NOW, expired: false });
  });

  it('returns empty answers when nothing is stored', () => {
    expect(load(NOW)).toEqual({ answers: emptyAnswers, savedAt: null, expired: false });
  });

  it('AC5.6 expired answers are removed and reported as expired', () => {
    save(answers, NOW);
    expect(load(NOW + ANSWERS_TTL_MS)).toEqual({ answers: emptyAnswers, savedAt: null, expired: true });
    expect(window.sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it.each([
    ['unparseable JSON', '{not json'],
    ['wrong version', { version: 1, savedAt: NOW, answers }],
    ['missing savedAt', { version: 2, answers }],
    ['savedAt not a number', { version: 2, savedAt: 'yesterday', answers }],
    ['savedAt in the future', { version: 2, savedAt: NOW + 1, answers }],
    ['invalid answer value (V1)', { version: 2, savedAt: NOW, answers: { ...answers, propertyType: 'castle' } }],
    ['exclusive option with others (V3)', { version: 2, savedAt: NOW, answers: { ...answers, priorGrants: ['none', 'insulation'] } }],
    ['consent not needed (V4)', { version: 2, savedAt: NOW, answers: { ...answers, ownership: 'mortgage', consent: 'yes' } }],
    ['answer to a skipped question (V6)', { version: 2, savedAt: NOW, answers: { ...answers, priorGrants: ['heatPump'], heating: 'other' } }],
  ])('AC5.2 discards %s', (_, value) => {
    put(value);
    expect(load(NOW)).toEqual({ answers: emptyAnswers, savedAt: null, expired: false });
    expect(window.sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('clear() removes the stored answers', () => {
    save(answers, NOW);
    clear();
    expect(window.sessionStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('AC5.3 does not throw when sessionStorage throws', () => {
    const boom = () => {
      throw new Error('storage disabled');
    };
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(boom);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(boom);
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(boom);
    expect(() => save(answers, NOW)).not.toThrow();
    expect(() => clear()).not.toThrow();
    expect(load(NOW)).toEqual({ answers: emptyAnswers, savedAt: null, expired: false });
  });

  it('AC5.3 does not throw when sessionStorage itself is unavailable', () => {
    vi.spyOn(window, 'sessionStorage', 'get').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(() => save(answers, NOW)).not.toThrow();
    expect(() => clear()).not.toThrow();
    expect(load(NOW).answers).toEqual(emptyAnswers);
  });
});
