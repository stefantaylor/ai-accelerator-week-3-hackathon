import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CookieBanner from './components/CookieBanner';
import GovukHeader from './components/GovukHeader';
import PhaseBanner from './components/PhaseBanner';
import GovukFooter from './components/GovukFooter';
import LanguageSelect from './components/LanguageSelect';
import { useLanguage } from './content/language.jsx';
import { emptyAnswers, setAnswer } from './state/answers.js';
import { load, save } from './state/answersStore.js';
import { guardRedirect } from './flow/journey.js';
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

// Sends the user to the first unanswered question if they skip ahead
function Guard({ route, answers, children }) {
  const redirect = guardRedirect(route, answers);
  return redirect ? <Navigate to={redirect} replace /> : children;
}

function App() {
  const { t } = useLanguage();
  const [answers, setAnswersState] = useState(() => load());

  // Save to storage whenever answers change
  useEffect(() => {
    save(answers);
  }, [answers]);

  const handleAnswer = (field, value) => {
    const updated = setAnswer(answers, field, value);
    setAnswersState(updated);
  };

  const handleReset = () => {
    setAnswersState({ ...emptyAnswers });
  };

  return (
    <>
      <CookieBanner />
      <a href="#main-content" className="govuk-skip-link">{t('skipLink')}</a>
      <GovukHeader />
      <PhaseBanner feedbackHref="#" />
      <div className="govuk-width-container">
        <LanguageSelect />
        <main className="govuk-main-wrapper" id="main-content" role="main" tabIndex={-1}>
          <Routes>
            <Route path="/" element={<StartPage answers={answers} onAnswer={handleAnswer} />} />
            <Route path="/prior-grants" element={<PriorGrantsPage answers={answers} onAnswer={handleAnswer} />} />
            <Route path="/property-type" element={<Guard route="/property-type" answers={answers}><PropertyTypePage answers={answers} onAnswer={handleAnswer} /></Guard>} />
            <Route path="/ownership" element={<Guard route="/ownership" answers={answers}><OwnershipPage answers={answers} onAnswer={handleAnswer} /></Guard>} />
            <Route path="/consent" element={<Guard route="/consent" answers={answers}><ConsentPage answers={answers} onAnswer={handleAnswer} /></Guard>} />
            <Route path="/income" element={<Guard route="/income" answers={answers}><IncomePage answers={answers} onAnswer={handleAnswer} /></Guard>} />
            <Route path="/insulation" element={<Guard route="/insulation" answers={answers}><InsulationPage answers={answers} onAnswer={handleAnswer} /></Guard>} />
            <Route path="/heating" element={<Guard route="/heating" answers={answers}><HeatingPage answers={answers} onAnswer={handleAnswer} /></Guard>} />
            <Route path="/check-answers" element={<Guard route="/check-answers" answers={answers}><CheckAnswersPage answers={answers} onAnswer={handleAnswer} /></Guard>} />
            <Route path="/result" element={<Guard route="/result" answers={answers}><ResultPage answers={answers} onAnswer={handleAnswer} onReset={handleReset} /></Guard>} />
            <Route path="/accessibility-statement" element={<AccessibilityStatementPage />} />
          </Routes>
        </main>
      </div>
      <GovukFooter />
    </>
  );
}

export default App;
