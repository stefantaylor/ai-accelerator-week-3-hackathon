// Page order, Back links and guards (spec §4.3). Pure.
import { isAnswered, isEarlyExit, requiredFields } from '../state/answers';

export const QUESTION_ROUTES = [
  { route: '/prior-grants', field: 'priorGrants' },
  { route: '/property-type', field: 'propertyType' },
  { route: '/ownership', field: 'ownership' },
  { route: '/consent', field: 'consent' },
  { route: '/income', field: 'incomeBand' },
  { route: '/insulation', field: 'uninsulatedParts' },
  { route: '/heating', field: 'heating' },
];

const ORDER = QUESTION_ROUTES.map((q) => q.route);

export function fieldForRoute(route) {
  return QUESTION_ROUTES.find((q) => q.route === route)?.field;
}

export function routeForField(field) {
  return QUESTION_ROUTES.find((q) => q.field === field)?.route;
}

// Question routes the user must visit, in journey order.
export function requiredRoutes(answers) {
  return requiredFields(answers).map(routeForField);
}

export function isJourneyComplete(answers) {
  return requiredFields(answers).every((f) => isAnswered(answers[f]));
}

export function firstIncompleteRoute(answers) {
  const field = requiredFields(answers).find((f) => !isAnswered(answers[f]));
  return field ? routeForField(field) : '/check-answers';
}

export function nextRoute(current, answers) {
  if (current === '/') return '/prior-grants';
  if (current === '/check-answers') return '/result';
  if (current === '/prior-grants' && isEarlyExit(answers)) return '/result';
  const required = requiredRoutes(answers);
  const after = ORDER.slice(ORDER.indexOf(current) + 1);
  return after.find((r) => required.includes(r)) ?? '/check-answers';
}

export function backRoute(current, answers) {
  if (current === '/result' || current === '/session-expired') return null;
  const required = requiredRoutes(answers);
  if (current === '/check-answers') return required[required.length - 1];
  const before = ORDER.slice(0, ORDER.indexOf(current)).reverse();
  return before.find((r) => required.includes(r)) ?? '/';
}

// Where Continue goes in change mode (?change=true).
export function nextRouteInChangeMode(answers) {
  if (isEarlyExit(answers)) return '/result';
  const missing = firstIncompleteRoute(answers);
  return missing === '/check-answers' ? '/check-answers' : `${missing}?change=true`;
}

// Route guard for question pages and check answers. Returns a route to
// redirect to, or null if the page may be shown. Check answers on the
// early-exit path returns '/result' (the caller finishes the journey).
export function guardRedirect(route, answers) {
  if (route === '/prior-grants') return null;
  if (route === '/check-answers') {
    if (isEarlyExit(answers)) return '/result';
    return isJourneyComplete(answers) ? null : firstIncompleteRoute(answers);
  }
  const required = requiredRoutes(answers);
  const earlier = ORDER.slice(0, ORDER.indexOf(route)).filter((r) => required.includes(r));
  const missing = earlier.find((r) => !isAnswered(answers[fieldForRoute(r)]));
  if (missing) return missing;
  if (!required.includes(route)) {
    // Skipped question (consent not needed, Q1 skip, or early exit).
    return isEarlyExit(answers) ? '/result' : nextRoute(route, answers);
  }
  return null;
}
