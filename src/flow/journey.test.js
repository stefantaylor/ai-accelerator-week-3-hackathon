import { describe, it, expect } from 'vitest';
import {
  nextRoute,
  backRoute,
  firstIncompleteRoute,
  isJourneyComplete,
  nextRouteInChangeMode,
  guardRedirect,
} from './journey';
import { emptyAnswers } from '../state/answers';

const owner = {
  ...emptyAnswers,
  priorGrants: ['none'],
  propertyType: 'detached',
  ownership: 'ownOutright',
  incomeBand: 'under12570',
  uninsulatedParts: ['loft'],
  heating: 'gasBoiler',
};
const renter = { ...owner, ownership: 'rent', consent: 'yes' };
const earlyExit = { ...emptyAnswers, priorGrants: ['insulation', 'heatPump'] };

describe('nextRoute (normal forward order)', () => {
  it('follows the owner path', () => {
    const path = ['/', '/prior-grants', '/property-type', '/ownership', '/income', '/insulation', '/heating', '/check-answers'];
    path.forEach((route, i) => {
      if (i < path.length - 1) expect(nextRoute(route, owner)).toBe(path[i + 1]);
    });
    expect(nextRoute('/check-answers', owner)).toBe('/result');
  });

  it('goes through consent for shared ownership or rent', () => {
    expect(nextRoute('/ownership', renter)).toBe('/consent');
    expect(nextRoute('/consent', renter)).toBe('/income');
    expect(nextRoute('/ownership', { ...owner, ownership: 'sharedOwnership' })).toBe('/consent');
  });

  it('early exit: both grants received goes straight to the result', () => {
    expect(nextRoute('/prior-grants', earlyExit)).toBe('/result');
  });

  it('AC4a.1 insulation grant received: skips /insulation', () => {
    const a = { ...owner, priorGrants: ['insulation'], uninsulatedParts: [] };
    expect(nextRoute('/income', a)).toBe('/heating');
    expect(backRoute('/heating', a)).toBe('/income');
    expect(isJourneyComplete(a)).toBe(true);
  });

  it('AC4a.2 heat pump grant received: skips /heating', () => {
    const a = { ...owner, priorGrants: ['heatPump'], heating: '' };
    expect(nextRoute('/insulation', a)).toBe('/check-answers');
    expect(backRoute('/check-answers', a)).toBe('/insulation');
    expect(isJourneyComplete(a)).toBe(true);
  });
});

describe('backRoute', () => {
  it.each([
    ['/prior-grants', owner, '/'],
    ['/property-type', owner, '/prior-grants'],
    ['/ownership', owner, '/property-type'],
    ['/consent', renter, '/ownership'],
    ['/income', renter, '/consent'],
    ['/income', owner, '/ownership'],
    ['/insulation', owner, '/income'],
    ['/heating', owner, '/insulation'],
    ['/check-answers', owner, '/heating'],
    ['/result', owner, null],
    ['/session-expired', owner, null],
  ])('%s goes back correctly', (current, answers, expected) => {
    expect(backRoute(current, answers)).toBe(expected);
  });

  it('AC4.3 back on /income depends on whether consent is required', () => {
    expect(backRoute('/income', renter)).toBe('/consent');
    expect(backRoute('/income', owner)).toBe('/ownership');
  });
});

describe('firstIncompleteRoute and isJourneyComplete', () => {
  it('starts at prior grants with no answers', () => {
    expect(firstIncompleteRoute(emptyAnswers)).toBe('/prior-grants');
    expect(isJourneyComplete(emptyAnswers)).toBe(false);
  });

  it('finds the first gap', () => {
    expect(firstIncompleteRoute({ ...owner, incomeBand: '' })).toBe('/income');
    expect(firstIncompleteRoute({ ...owner, ownership: 'rent' })).toBe('/consent');
  });

  it('points to check answers when everything is answered', () => {
    expect(firstIncompleteRoute(owner)).toBe('/check-answers');
    expect(isJourneyComplete(owner)).toBe(true);
    expect(isJourneyComplete(renter)).toBe(true);
  });
});

describe('nextRouteInChangeMode', () => {
  it('returns to check answers when nothing is missing', () => {
    expect(nextRouteInChangeMode(owner)).toBe('/check-answers');
  });

  it('sends a new renter to consent in change mode', () => {
    expect(nextRouteInChangeMode({ ...owner, ownership: 'rent' })).toBe('/consent?change=true');
  });

  it('sends to a question that is needed again after removing a prior grant', () => {
    const a = { ...owner, priorGrants: ['none'], uninsulatedParts: [] };
    expect(nextRouteInChangeMode(a)).toBe('/insulation?change=true');
  });

  it('early exit goes to the result', () => {
    expect(nextRouteInChangeMode({ ...owner, priorGrants: ['insulation', 'heatPump'] })).toBe('/result');
  });
});

describe('guardRedirect', () => {
  it('always allows prior grants', () => {
    expect(guardRedirect('/prior-grants', emptyAnswers)).toBeNull();
  });

  it('redirects deep links to the first missing earlier answer', () => {
    expect(guardRedirect('/heating', emptyAnswers)).toBe('/prior-grants');
    expect(guardRedirect('/heating', { ...owner, incomeBand: '' })).toBe('/income');
    expect(guardRedirect('/heating', owner)).toBeNull();
  });

  it('skips consent when it is not needed', () => {
    expect(guardRedirect('/consent', owner)).toBe('/income');
  });

  it('AC4a.4 skips a question for a grant already received', () => {
    expect(guardRedirect('/insulation', { ...owner, priorGrants: ['insulation'], uninsulatedParts: [] })).toBe('/heating');
    expect(guardRedirect('/heating', { ...owner, priorGrants: ['heatPump'], heating: '' })).toBe('/check-answers');
  });

  it('check answers needs a complete journey, and sends early exit to the result', () => {
    expect(guardRedirect('/check-answers', { ...owner, heating: '' })).toBe('/heating');
    expect(guardRedirect('/check-answers', owner)).toBeNull();
    expect(guardRedirect('/check-answers', earlyExit)).toBe('/result');
  });
});
