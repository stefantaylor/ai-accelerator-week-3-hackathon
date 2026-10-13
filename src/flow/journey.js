// Journey/flow logic - determines route order and navigation

import { isAnswered } from '../state/answers.js';

// Routes that are always required
const ALWAYS_REQUIRED = ['/prior-grants'];

// Routes required after early exit (both prior grants selected)
const EARLY_EXIT_ROUTES = ['/prior-grants', '/result'];

// Determine which routes are required based on answers
function getRequiredRoutes(answers) {
  const { priorGrants = [], ownership = '' } = answers;

  // Early exit: if both grant types already received
  if (priorGrants.includes('insulation') && priorGrants.includes('heatPump')) {
    return EARLY_EXIT_ROUTES;
  }

  // Normal path
  let required = [...ALWAYS_REQUIRED];

  // After prior grants, always require these
  if (!isAnswered('priorGrants', priorGrants) || priorGrants.length === 0) {
    return required;
  }

  required.push('/property-type', '/ownership');

  // Consent required for shared ownership or rent
  if (ownership === 'sharedOwnership' || ownership === 'rent') {
    required.push('/consent');
  }

  required.push('/income', '/insulation', '/heating', '/check-answers', '/result');

  return required;
}

// Check if all required routes up to current are answered
function areAllRequiredBefore(current, answers) {
  const required = getRequiredRoutes(answers);
  const currentIndex = required.indexOf(current);
  if (currentIndex === -1) return false;

  const beforeCurrent = required.slice(0, currentIndex);
  return beforeCurrent.every(route => isRouteAnswered(route, answers));
}

// Check if a specific route is answered
function isRouteAnswered(route, answers) {
  const {
    priorGrants = [],
    propertyType = '',
    ownership = '',
    consent = '',
    incomeBand = '',
    uninsulatedParts = [],
    heating = '',
  } = answers;

  switch (route) {
    case '/prior-grants':
      return isAnswered('priorGrants', priorGrants);
    case '/property-type':
      return isAnswered('propertyType', propertyType);
    case '/ownership':
      return isAnswered('ownership', ownership);
    case '/consent':
      // Only required if ownership needs consent
      if (ownership !== 'sharedOwnership' && ownership !== 'rent') {
        return true;
      }
      return isAnswered('consent', consent);
    case '/income':
      return isAnswered('incomeBand', incomeBand);
    case '/insulation':
      return isAnswered('uninsulatedParts', uninsulatedParts);
    case '/heating':
      return isAnswered('heating', heating);
    case '/check-answers':
    case '/result':
      return true; // No-op pages
    default:
      return false;
  }
}

// Get the next route after current
export function nextRoute(current, answers) {
  const required = getRequiredRoutes(answers);
  const currentIndex = required.indexOf(current);

  if (currentIndex === -1) return '/prior-grants'; // Unknown route
  if (currentIndex === required.length - 1) return current; // Already at end

  return required[currentIndex + 1];
}

// Get the route after Continue, returning to check answers when changing an answer
export function continueRoute(current, answers, isChange) {
  if (!isChange) return nextRoute(current, answers);

  if (getRequiredRoutes(answers).includes('/check-answers') && isJourneyComplete(answers)) {
    return '/check-answers';
  }

  // The change opened up a new question - ask it, then come back
  const next = nextRoute(current, answers);
  return next === '/result' ? next : `${next}?change=true`;
}

// Get the back route (handles consent conditional)
export function backRoute(current, answers) {
  const { ownership = '' } = answers;
  const consentRequired = ownership === 'sharedOwnership' || ownership === 'rent';

  const backMap = {
    '/prior-grants': '/',
    '/property-type': '/prior-grants',
    '/ownership': '/property-type',
    '/consent': '/ownership',
    '/income': consentRequired ? '/consent' : '/ownership',
    '/insulation': '/income',
    '/heating': '/insulation',
    '/check-answers': '/heating',
    '/result': '/prior-grants', // Or /check-answers on normal path
  };

  return backMap[current] || '/prior-grants';
}

// Determine back route considering early exit
export function backRouteWithEarlyExit(current, answers) {
  const { priorGrants = [] } = answers;
  const onEarlyExit = priorGrants.includes('insulation') && priorGrants.includes('heatPump');

  if (current === '/result' && onEarlyExit) {
    return '/prior-grants';
  }
  if (current === '/result') {
    return '/check-answers';
  }

  return backRoute(current, answers);
}

// Get first incomplete route (for guards and redirects)
export function firstIncompleteRoute(answers) {
  const required = getRequiredRoutes(answers);

  for (const route of required) {
    if (!isRouteAnswered(route, answers)) {
      return route;
    }
  }

  return '/result'; // All complete
}

// Check if the entire journey is complete
export function isJourneyComplete(answers) {
  const required = getRequiredRoutes(answers);
  return required.every(route => isRouteAnswered(route, answers));
}

// Check if a route is accessible (all required before it are answered)
export function canAccessRoute(route, answers) {
  if (route === '/') return true; // Start page always accessible
  if (route === '/prior-grants') return true; // First question always accessible

  // Check if early exit applies
  const { priorGrants = [] } = answers;
  const onEarlyExit = priorGrants.includes('insulation') && priorGrants.includes('heatPump');

  if (onEarlyExit && route === '/result') return true; // Result always accessible on early exit
  if (onEarlyExit && route !== '/prior-grants' && route !== '/result') return false; // Only /prior-grants and /result on early exit

  // Normal path: check if all required routes before this are answered
  return areAllRequiredBefore(route, answers);
}

// Route guard: where to send the user instead, or null if they can stay
export function guardRedirect(route, answers) {
  if (canAccessRoute(route, answers)) return null;

  // Consent not needed for this ownership type - skip past it
  if (route === '/consent' && isAnswered('ownership', answers.ownership) && !shouldShowConsent(answers)) {
    return nextRoute('/ownership', answers);
  }

  return firstIncompleteRoute(answers);
}

// Special consent logic: if ownership changes to a type that doesn't need consent,
// and we're at /consent, should we show it or skip to next?
export function shouldShowConsent(answers) {
  const { ownership = '' } = answers;
  return ownership === 'sharedOwnership' || ownership === 'rent';
}
