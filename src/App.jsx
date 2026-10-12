import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import GovukHeader from './components/GovukHeader';
import PhaseBanner from './components/PhaseBanner';
import GovukFooter from './components/GovukFooter';
import { emptyAnswers, setAnswer } from './state/answers.js';
import { load, save } from './state/answersStore.js';
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

function App() {
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
      <GovukHeader />
      <PhaseBanner phase="alpha" feedbackHref="#" />
      <div className="govuk-width-container">
        <main className="govuk-main-wrapper" role="main">
          <Routes>
            <Route path="/" element={<StartPage answers={answers} onAnswer={handleAnswer} />} />
            <Route path="/prior-grants" element={<PriorGrantsPage answers={answers} onAnswer={handleAnswer} />} />
            <Route path="/property-type" element={<PropertyTypePage answers={answers} onAnswer={handleAnswer} />} />
            <Route path="/ownership" element={<OwnershipPage answers={answers} onAnswer={handleAnswer} />} />
            <Route path="/consent" element={<ConsentPage answers={answers} onAnswer={handleAnswer} />} />
            <Route path="/income" element={<IncomePage answers={answers} onAnswer={handleAnswer} />} />
            <Route path="/insulation" element={<InsulationPage answers={answers} onAnswer={handleAnswer} />} />
            <Route path="/heating" element={<HeatingPage answers={answers} onAnswer={handleAnswer} />} />
            <Route path="/check-answers" element={<CheckAnswersPage answers={answers} onAnswer={handleAnswer} />} />
            <Route path="/result" element={<ResultPage answers={answers} onAnswer={handleAnswer} onReset={handleReset} />} />
            <Route path="/accessibility-statement" element={<AccessibilityStatementPage />} />
          </Routes>
        </main>
      </div>
      <GovukFooter />
    </>
  );
}

export default App;
