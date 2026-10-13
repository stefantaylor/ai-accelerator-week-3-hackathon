import { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import CookieBanner from './components/CookieBanner';
import GovukHeader from './components/GovukHeader';
import PhaseBanner from './components/PhaseBanner';
import GovukFooter from './components/GovukFooter';
import LanguageSelect from './components/LanguageSelect';
import { useLanguage } from './content/language.jsx';
import { emptyAnswers, setAnswer } from './state/answers.js';
import { load, save } from './state/answersStore.js';
import { guardRedirect } from './flow/journey.js';
import { contactEmail } from './content/labels.js';
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
import AccessibilityStatementPage from './pages/AccessibilityStatementPage';
import NotFoundPage from './pages/NotFoundPage';

// Question pages in journey order. Every route after /prior-grants is guarded.
const QUESTION_PAGES = [
  ['/property-type', PropertyTypePage],
  ['/ownership', OwnershipPage],
  ['/consent', ConsentPage],
  ['/income', IncomePage],
  ['/insulation', InsulationPage],
  ['/heating', HeatingPage],
  ['/check-answers', CheckAnswersPage],
];

// Sends the user to the first unanswered question if they skip ahead
function Guard({ route, answers, children }) {
  const redirect = guardRedirect(route, answers);
  return redirect ? <Navigate to={redirect} replace /> : children;
}

function App() {
  const { t } = useLanguage();
  const [answers, setAnswersState] = useState(() => load());
  const location = useLocation();
  const mainRef = useRef(null);
  const previousPath = useRef(location.pathname);

  // Save to storage whenever answers change
  useEffect(() => {
    save(answers);
  }, [answers]);

  // This is a single-page app, so moving between pages does not reset focus.
  // Move focus to the main content on each new page so screen reader users
  // hear the new question. Not on first load, where the browser does this.
  useEffect(() => {
    if (location.pathname !== previousPath.current) {
      previousPath.current = location.pathname;
      mainRef.current?.focus();
    }
  }, [location.pathname]);

  const handleAnswer = (field, value) => {
    setAnswersState(setAnswer(answers, field, value));
  };

  const handleReset = () => {
    setAnswersState({ ...emptyAnswers });
  };

  return (
    <>
      <CookieBanner />
      <a href="#main-content" className="govuk-skip-link">{t('skipLink')}</a>
      <GovukHeader />
      <PhaseBanner feedbackHref={`mailto:${contactEmail}`} />
      <div className="govuk-width-container">
        <LanguageSelect />
        <main className="govuk-main-wrapper" id="main-content" ref={mainRef} tabIndex={-1}>
          <Routes>
            <Route path="/" element={<StartPage />} />
            <Route path="/prior-grants" element={<PriorGrantsPage answers={answers} onAnswer={handleAnswer} />} />
            {QUESTION_PAGES.map(([path, Page]) => (
              <Route
                key={path}
                path={path}
                element={(
                  <Guard route={path} answers={answers}>
                    <Page answers={answers} onAnswer={handleAnswer} />
                  </Guard>
                )}
              />
            ))}
            <Route
              path="/result"
              element={(
                <Guard route="/result" answers={answers}>
                  <ResultPage answers={answers} onReset={handleReset} />
                </Guard>
              )}
            />
            <Route path="/accessibility-statement" element={<AccessibilityStatementPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
      <GovukFooter />
    </>
  );
}

export default App;
