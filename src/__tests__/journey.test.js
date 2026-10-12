import { describe, it, expect } from 'vitest';
import {
  nextRoute,
  continueRoute,
  backRoute,
  backRouteWithEarlyExit,
  firstIncompleteRoute,
  isJourneyComplete,
  canAccessRoute,
  shouldShowConsent,
} from '../flow/journey.js';
import { emptyAnswers } from '../state/answers.js';

describe('journey.js', () => {
  describe('nextRoute', () => {
    it('goes from /prior-grants to /property-type', () => {
      const answers = {
        ...emptyAnswers,
        priorGrants: ['none'],
      };
      expect(nextRoute('/prior-grants', answers)).toBe('/property-type');
    });

    it('skips /consent when ownership is ownOutright', () => {
      const answers = {
        ...emptyAnswers,
        priorGrants: ['none'],
        propertyType: 'detached',
        ownership: 'ownOutright',
      };
      expect(nextRoute('/ownership', answers)).toBe('/income');
    });

    it('goes to /consent when ownership is sharedOwnership', () => {
      const answers = {
        ...emptyAnswers,
        priorGrants: ['none'],
        propertyType: 'detached',
        ownership: 'sharedOwnership',
      };
      expect(nextRoute('/ownership', answers)).toBe('/consent');
    });

    it('goes to /consent when ownership is rent', () => {
      const answers = {
        ...emptyAnswers,
        priorGrants: ['none'],
        propertyType: 'detached',
        ownership: 'rent',
      };
      expect(nextRoute('/ownership', answers)).toBe('/consent');
    });

    it('returns /result for unknown route', () => {
      expect(nextRoute('/unknown', emptyAnswers)).toBe('/prior-grants');
    });
  });

  describe('continueRoute', () => {
    const complete = {
      ...emptyAnswers,
      priorGrants: ['none'],
      propertyType: 'detached',
      ownership: 'ownOutright',
      incomeBand: 'under12570',
      uninsulatedParts: ['loft'],
      heating: 'gasBoiler',
    };

    it('follows the normal journey when not changing an answer', () => {
      expect(continueRoute('/property-type', complete, false)).toBe('/ownership');
    });

    it('returns to /check-answers after changing an answer', () => {
      expect(continueRoute('/property-type', complete, true)).toBe('/check-answers');
    });

    it('asks a newly required question before returning to /check-answers', () => {
      const answers = { ...complete, ownership: 'rent' };
      expect(continueRoute('/ownership', answers, true)).toBe('/consent?change=true');
      expect(continueRoute('/consent', { ...answers, consent: 'yes' }, true)).toBe('/check-answers');
    });

    it('goes to /result when a change leads to early exit', () => {
      const answers = { ...complete, priorGrants: ['insulation', 'heatPump'] };
      expect(continueRoute('/prior-grants', answers, true)).toBe('/result');
    });
  });

  describe('backRoute', () => {
    it('/prior-grants goes to /', () => {
      expect(backRoute('/prior-grants', emptyAnswers)).toBe('/');
    });

    it('/property-type goes to /prior-grants', () => {
      expect(backRoute('/property-type', emptyAnswers)).toBe('/prior-grants');
    });

    it('/ownership goes to /property-type', () => {
      expect(backRoute('/ownership', emptyAnswers)).toBe('/property-type');
    });

    it('/consent goes to /ownership', () => {
      expect(backRoute('/consent', emptyAnswers)).toBe('/ownership');
    });

    it('/income goes to /ownership when consent not required', () => {
      const answers = {
        ...emptyAnswers,
        ownership: 'ownOutright',
      };
      expect(backRoute('/income', answers)).toBe('/ownership');
    });

    it('/income goes to /consent when consent required', () => {
      const answers = {
        ...emptyAnswers,
        ownership: 'sharedOwnership',
      };
      expect(backRoute('/income', answers)).toBe('/consent');
    });

    it('/insulation goes to /income', () => {
      expect(backRoute('/insulation', emptyAnswers)).toBe('/income');
    });

    it('/heating goes to /insulation', () => {
      expect(backRoute('/heating', emptyAnswers)).toBe('/insulation');
    });

    it('/check-answers goes to /heating', () => {
      expect(backRoute('/check-answers', emptyAnswers)).toBe('/heating');
    });
  });

  describe('backRouteWithEarlyExit', () => {
    it('goes to /prior-grants from /result on early exit', () => {
      const answers = {
        ...emptyAnswers,
        priorGrants: ['insulation', 'heatPump'],
      };
      expect(backRouteWithEarlyExit('/result', answers)).toBe('/prior-grants');
    });

    it('goes to /check-answers from /result on normal path', () => {
      const answers = {
        ...emptyAnswers,
        priorGrants: ['none'],
      };
      expect(backRouteWithEarlyExit('/result', answers)).toBe('/check-answers');
    });
  });

  describe('firstIncompleteRoute', () => {
    it('returns /prior-grants when nothing answered', () => {
      expect(firstIncompleteRoute(emptyAnswers)).toBe('/prior-grants');
    });

    it('returns /property-type when priorGrants answered', () => {
      const answers = {
        ...emptyAnswers,
        priorGrants: ['none'],
      };
      expect(firstIncompleteRoute(answers)).toBe('/property-type');
    });

    it('returns /consent when ownership is sharedOwnership and consent not answered', () => {
      const answers = {
        ...emptyAnswers,
        priorGrants: ['none'],
        propertyType: 'detached',
        ownership: 'sharedOwnership',
      };
      expect(firstIncompleteRoute(answers)).toBe('/consent');
    });

    it('returns /income when ownership is ownOutright, consent skipped', () => {
      const answers = {
        ...emptyAnswers,
        priorGrants: ['none'],
        propertyType: 'detached',
        ownership: 'ownOutright',
      };
      expect(firstIncompleteRoute(answers)).toBe('/income');
    });

    it('returns /result when all complete', () => {
      const answers = {
        ...emptyAnswers,
        priorGrants: ['none'],
        propertyType: 'detached',
        ownership: 'ownOutright',
        incomeBand: 'under12570',
        uninsulatedParts: ['loft'],
        heating: 'gasBoiler',
      };
      expect(firstIncompleteRoute(answers)).toBe('/result');
    });

    it('returns /result on early exit (both priors answered)', () => {
      const answers = {
        ...emptyAnswers,
        priorGrants: ['insulation', 'heatPump'],
      };
      expect(firstIncompleteRoute(answers)).toBe('/result');
    });
  });

  describe('isJourneyComplete', () => {
    it('returns false when incomplete', () => {
      const answers = {
        ...emptyAnswers,
        priorGrants: ['none'],
      };
      expect(isJourneyComplete(answers)).toBe(false);
    });

    it('returns true when all fields answered', () => {
      const answers = {
        ...emptyAnswers,
        priorGrants: ['none'],
        propertyType: 'detached',
        ownership: 'ownOutright',
        incomeBand: 'under12570',
        uninsulatedParts: ['loft'],
        heating: 'gasBoiler',
      };
      expect(isJourneyComplete(answers)).toBe(true);
    });

    it('returns true for early exit', () => {
      const answers = {
        ...emptyAnswers,
        priorGrants: ['insulation', 'heatPump'],
      };
      expect(isJourneyComplete(answers)).toBe(true);
    });
  });

  describe('canAccessRoute', () => {
    it('can access / (start page)', () => {
      expect(canAccessRoute('/', emptyAnswers)).toBe(true);
    });

    it('can access /prior-grants (first question)', () => {
      expect(canAccessRoute('/prior-grants', emptyAnswers)).toBe(true);
    });

    it('cannot access /property-type without priorGrants', () => {
      expect(canAccessRoute('/property-type', emptyAnswers)).toBe(false);
    });

    it('can access /property-type with priorGrants answered', () => {
      const answers = {
        ...emptyAnswers,
        priorGrants: ['none'],
      };
      expect(canAccessRoute('/property-type', answers)).toBe(true);
    });

    it('cannot access /income without earlier questions answered', () => {
      const answers = {
        ...emptyAnswers,
        priorGrants: ['none'],
        propertyType: 'detached',
      };
      expect(canAccessRoute('/income', answers)).toBe(false);
    });

    it('can access /result with all fields answered', () => {
      const answers = {
        ...emptyAnswers,
        priorGrants: ['none'],
        propertyType: 'detached',
        ownership: 'ownOutright',
        incomeBand: 'under12570',
        uninsulatedParts: ['loft'],
        heating: 'gasBoiler',
      };
      expect(canAccessRoute('/result', answers)).toBe(true);
    });

    it('can access /result on early exit', () => {
      const answers = {
        ...emptyAnswers,
        priorGrants: ['insulation', 'heatPump'],
      };
      expect(canAccessRoute('/result', answers)).toBe(true);
    });

    it('cannot access /result on early exit with other routes', () => {
      const answers = {
        ...emptyAnswers,
        priorGrants: ['insulation', 'heatPump'],
      };
      expect(canAccessRoute('/property-type', answers)).toBe(false);
    });

    it('cannot access /result without journey complete on normal path', () => {
      const answers = {
        ...emptyAnswers,
        priorGrants: ['none'],
        propertyType: 'detached',
      };
      expect(canAccessRoute('/result', answers)).toBe(false);
    });
  });

  describe('shouldShowConsent', () => {
    it('returns true for sharedOwnership', () => {
      const answers = {
        ...emptyAnswers,
        ownership: 'sharedOwnership',
      };
      expect(shouldShowConsent(answers)).toBe(true);
    });

    it('returns true for rent', () => {
      const answers = {
        ...emptyAnswers,
        ownership: 'rent',
      };
      expect(shouldShowConsent(answers)).toBe(true);
    });

    it('returns false for ownOutright', () => {
      const answers = {
        ...emptyAnswers,
        ownership: 'ownOutright',
      };
      expect(shouldShowConsent(answers)).toBe(false);
    });

    it('returns false for mortgage', () => {
      const answers = {
        ...emptyAnswers,
        ownership: 'mortgage',
      };
      expect(shouldShowConsent(answers)).toBe(false);
    });

    it('returns false when ownership not answered', () => {
      expect(shouldShowConsent(emptyAnswers)).toBe(false);
    });
  });
});
