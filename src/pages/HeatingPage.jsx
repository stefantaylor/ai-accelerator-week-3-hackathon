import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import RadioGroup from '../components/RadioGroup';
import ErrorSummary from '../components/ErrorSummary';
import GovukButton from '../components/GovukButton';
import { isAnswered } from '../state/answers.js';
import { getLabel } from '../content/labels.js';
import { continueRoute, backRoute } from '../flow/journey.js';

function HeatingPage({ answers, onAnswer }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [errors, setErrors] = useState([]);

  document.title = `${errors.length ? 'Error: ' : ''}What is your main heating system? - Check if you can get a Green Home Grant - GOV.UK`;

  const handleContinue = () => {
    if (!isAnswered('heating', answers.heating)) {
      setErrors([{ fieldId: 'heating', message: 'Select your main heating system' }]);
      return;
    }

    setErrors([]);
    onAnswer('heating', answers.heating);
    navigate(continueRoute('/heating', answers, searchParams.get('change') === 'true'));
  };

  const handleBack = () => {
    navigate(backRoute('/heating', answers));
  };

  const options = [
    { value: 'gasBoiler', label: getLabel('heating', 'gasBoiler') },
    { value: 'oilBoiler', label: getLabel('heating', 'oilBoiler') },
    { value: 'electric', label: getLabel('heating', 'electric') },
    { value: 'heatPump', label: getLabel('heating', 'heatPump') },
    { value: 'other', label: getLabel('heating', 'other') },
  ];

  return (
    <>
      <a href="#" className="govuk-back-link" onClick={(e) => { e.preventDefault(); handleBack(); }}>
        Back
      </a>

      <ErrorSummary errors={errors} />

      <RadioGroup
        name="heating"
        legend="What is your main heating system?"
        options={options}
        value={answers.heating}
        onChange={(value) => onAnswer('heating', value)}
        error={errors.find(e => e.fieldId === 'heating')?.message}
      />

      <GovukButton onClick={handleContinue}>Continue</GovukButton>
    </>
  );
}

export default HeatingPage;
