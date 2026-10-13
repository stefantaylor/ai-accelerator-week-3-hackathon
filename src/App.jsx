import { useCallback, useEffect, useRef, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import GovukHeader from './components/GovukHeader';
import ServiceNavigation from './components/ServiceNavigation';
import PhaseBanner from './components/PhaseBanner';
import GovukFooter from './components/GovukFooter';
import BackLink from './components/BackLink';
import TimeoutWarning from './components/TimeoutWarning';
import StartPage from './pages/StartPage';
import PriorGrantsPage from './pages/PriorGrantsPage';
import PropertyTypePage from './pages/PropertyTypePage';
import OwnershipPage from './pages/OwnershipPage';
import ConsentPage from './pages/ConsentPage';
import IncomePage from './pages/IncomePage';
import InsulationPage from './pages/InsulationPage';
import HeatingPage from './pages/HeatingPage';
import CheckAnswersPage from './pages/CheckAnswersPage';
import ResultPage from './pages/ResultPage';
import SessionExpiredPage from './pages/SessionExpiredPage';
import NotFoundPage from './pages/NotFoundPage';
import AccessibilityStatementPage from './pages/AccessibilityStatementPage';
import * as answersStore from './state/answersStore';
import { emptyAnswers, setAnswer } from './state/answers';
import { ANSWERS_TTL_MS, WARNING_AFTER_MS, isExpired } from './state/expiry';
import { assessEligibility } from './eligibility/assessEligibility';
import { QUESTION_ROUTES, backRoute, firstIncompleteRoute, guardRedirect } from './flow/journey';

const QUESTION_PAGES = {
  '/prior-grants': PriorGrantsPage,
  '/property-type': PropertyTypePage,
  '/ownership': OwnershipPage,
  '/consent': ConsentPage,
  '/income': IncomePage,
  '/insulation': InsulationPage,
  '/heating': HeatingPage,
};

const BACK_LINK_ROUTES = [...QUESTION_ROUTES.map((q) => q.route), '/check-answers'];

// Calls onFinish once from an effect (used when a guard finds the early exit).
function FinishJourney({ answers, onFinish }) {
  useEffect(() => {
    onFinish(answers);
  }, [answers, onFinish]);
  return null;
}

function Guarded({ route, answers, onFinish, children }) {
  const redirect = guardRedirect(route, answers);
  if (redirect === '/result') return <FinishJourney answers={answers} onFinish={onFinish} />;
  if (redirect) return <Navigate to={redirect} replace />;
  return children;
}

function App({ initial }) {
  const [loaded] = useState(() => initial ?? answersStore.load(Date.now()));
  const [answers, setAnswers] = useState(loaded.answers);
  const [savedAt, setSavedAt] = useState(loaded.savedAt);
  const [outcome, setOutcome] = useState(null);
  const [warningVisible, setWarningVisible] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const changeMode = searchParams.get('change') === 'true';

  // Refs so timers and event listeners always see the latest values.
  const answersRef = useRef(answers);
  const savedAtRef = useRef(savedAt);
  answersRef.current = answers;
  savedAtRef.current = savedAt;

  // Deletes the answers and moves to `path`. Storage is cleared straight
  // away, but the in-memory answers are only reset once `path` has loaded:
  // React Router applies navigation as a transition, so clearing them first
  // would let the old page's guard redirect before we get there.
  const pendingReset = useRef(null);
  const deleteAnswersAndGoTo = useCallback(
    (path, options) => {
      answersStore.clear();
      answersRef.current = emptyAnswers;
      savedAtRef.current = null;
      setSavedAt(null);
      setWarningVisible(false);
      pendingReset.current = path;
      navigate(path, options);
    },
    [navigate],
  );

  const expire = useCallback(() => {
    deleteAnswersAndGoTo('/session-expired', { replace: true });
  }, [deleteAnswersAndGoTo]);

  // Returns true (and expires the answers) if 10 minutes have passed (§4.8).
  const checkExpired = useCallback(() => {
    if (!isExpired(savedAtRef.current, Date.now())) return false;
    expire();
    return true;
  }, [expire]);

  const progress = useCallback((nextAnswers) => {
    const now = Date.now();
    answersRef.current = nextAnswers;
    savedAtRef.current = now;
    setAnswers(nextAnswers);
    setSavedAt(now);
    answersStore.save(nextAnswers, now);
  }, []);

  // Saves one answer. Returns the updated answers, or null if they had expired.
  const onAnswer = useCallback(
    (field, value) => {
      if (checkExpired()) return null;
      const next = setAnswer(answersRef.current, field, value);
      progress(next);
      return next;
    },
    [checkExpired, progress],
  );

  // Snapshots the result, deletes the answers and shows the result (§4.7).
  const onFinish = useCallback(
    (finalAnswers) => {
      if (checkExpired()) return;
      setOutcome({ answers: finalAnswers, result: assessEligibility(finalAnswers) });
      deleteAnswersAndGoTo('/result');
    },
    [checkExpired, deleteAnswersAndGoTo],
  );

  const onKeep = useCallback(() => {
    if (checkExpired()) return;
    progress(answersRef.current);
  }, [checkExpired, progress]);

  // Answers found expired when the app first loads (§4.7).
  useEffect(() => {
    if (loaded.expired) navigate('/session-expired', { replace: true });
  }, [loaded, navigate]);

  // Warning and expiry timers, reset whenever savedAt changes (§4.8).
  useEffect(() => {
    setWarningVisible(false);
    if (savedAt === null) return undefined;
    const elapsed = Date.now() - savedAt;
    const warningTimer = setTimeout(() => setWarningVisible(true), Math.max(0, WARNING_AFTER_MS - elapsed));
    const expiryTimer = setTimeout(() => checkExpired(), Math.max(0, ANSWERS_TTL_MS - elapsed));
    return () => {
      clearTimeout(warningTimer);
      clearTimeout(expiryTimer);
    };
  }, [savedAt, checkExpired]);

  // Background tabs can delay timers, so check again when the tab is shown.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') checkExpired();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [checkExpired]);

  // On every route change: check expiry, drop the result snapshot when
  // leaving /result, and move focus to the new page's heading.
  const previousPath = useRef(location.pathname);
  useEffect(() => {
    if (pendingReset.current === location.pathname) {
      pendingReset.current = null;
      setAnswers(emptyAnswers);
    }
    const from = previousPath.current;
    previousPath.current = location.pathname;
    if (from === location.pathname) return;
    if (checkExpired()) return;
    if (from === '/result') setOutcome(null);
    const heading = document.querySelector('main h1');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
    window.scrollTo?.(0, 0);
  }, [location.pathname, checkExpired]);

  const pageProps = { answers, onAnswer, onFinish };
  const backTo = BACK_LINK_ROUTES.includes(location.pathname)
    ? changeMode
      ? '/check-answers'
      : backRoute(location.pathname, answers)
    : null;

  return (
    <>
      <a href="#main-content" className="govuk-skip-link">
        Skip to main content
      </a>
      <header className="govuk-template__header">
        <GovukHeader />
        <ServiceNavigation />
      </header>
      <PhaseBanner phase="alpha" feedbackHref="#" />
      <div className="govuk-width-container">
        {backTo && <BackLink to={backTo} />}
        <main className="govuk-main-wrapper" id="main-content">
          {warningVisible && savedAt !== null && <TimeoutWarning onKeep={onKeep} />}
          <Routes>
            <Route path="/" element={<StartPage />} />
            {Object.entries(QUESTION_PAGES).map(([route, Page]) => (
              <Route
                key={route}
                path={route}
                element={
                  <Guarded route={route} answers={answers} onFinish={onFinish}>
                    <Page {...pageProps} />
                  </Guarded>
                }
              />
            ))}
            <Route
              path="/check-answers"
              element={
                <Guarded route="/check-answers" answers={answers} onFinish={onFinish}>
                  <CheckAnswersPage {...pageProps} />
                </Guarded>
              }
            />
            <Route
              path="/result"
              element={
                outcome ? <ResultPage outcome={outcome} /> : <Navigate to={firstIncompleteRoute(answers)} replace />
              }
            />
            <Route path="/session-expired" element={<SessionExpiredPage />} />
            <Route path="/accessibility-statement" element={<AccessibilityStatementPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
      <footer className="govuk-template__footer">
        <GovukFooter />
      </footer>
    </>
  );
}

export default App;
