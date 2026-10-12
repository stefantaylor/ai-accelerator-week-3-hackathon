import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RadioGroup from '../components/RadioGroup';
import ErrorSummary from '../components/ErrorSummary';
import GovukButton from '../components/GovukButton';
import { isAnswered } from '../state/answers.js';
import { getLabel } from '../content/labels.js';
import { nextRoute, backRoute } from '../flow/journey.js';

function IncomePage({ answers, onAnswer }) {
  const navigate = useNavigate();
  const [errors, setErrors] = useState([]);

  document.title = `${errors.length ? 'Error: ' : ''}What is your annual household income? - Check if you can get a Green Home Grant - GOV.UK`;

  const handleContinue = () => {
    if (!isAnswered('incomeBand', answers.incomeBand)) {
      setErrors([{ fieldId: 'incomeBand', message: 'Select your annual household income' }]);
      return;
    }

    setErrors([]);
    onAnswer('incomeBand', answers.incomeBand);
    navigate(nextRoute('/income', answers));
  };

  const handleBack = () => {
    navigate(backRoute('/income', answers));
  };

  const options = [
    { value: 'under12570', label: getLabel('incomeBand', 'under12570') },
    { value: '12571to50270', label: getLabel('incomeBand', '12571to50270') },
    { value: '50271to125140', label: getLabel('incomeBand', '50271to125140') },
    { value: 'over125141', label: getLabel('incomeBand', 'over125141') },
  ];

  return (
    <>
      <a href="#" className="govuk-back-link" onClick={(e) => { e.preventDefault(); handleBack(); }}>
        Back
      </a>

      <ErrorSummary errors={errors} />

      <RadioGroup
        name="incomeBand"
        legend="What is your annual household income?"
        options={options}
        value={answers.incomeBand}
        onChange={(value) => onAnswer('incomeBand', value)}
        error={errors.find(e => e.fieldId === 'incomeBand')?.message}
      />

      <GovukButton onClick={handleContinue}>Continue</GovukButton>
    </>
  );
}

export default IncomePage;
