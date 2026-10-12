import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RadioGroup from '../components/RadioGroup';
import ErrorSummary from '../components/ErrorSummary';
import GovukButton from '../components/GovukButton';
import { isAnswered } from '../state/answers.js';
import { getLabel } from '../content/labels.js';
import { nextRoute, backRoute } from '../flow/journey.js';

function PropertyTypePage({ answers, onAnswer }) {
  const navigate = useNavigate();
  const [errors, setErrors] = useState([]);

  document.title = `${errors.length ? 'Error: ' : ''}What type of property do you live in? - Check if you can get a Green Home Grant - GOV.UK`;

  const handleContinue = () => {
    if (!isAnswered('propertyType', answers.propertyType)) {
      setErrors([{ fieldId: 'propertyType', message: 'Select the type of property you live in' }]);
      return;
    }

    setErrors([]);
    onAnswer('propertyType', answers.propertyType);
    navigate(nextRoute('/property-type', answers));
  };

  const handleBack = () => {
    navigate(backRoute('/property-type', answers));
  };

  const options = [
    { value: 'detached', label: getLabel('propertyType', 'detached') },
    { value: 'semiDetached', label: getLabel('propertyType', 'semiDetached') },
    { value: 'terraced', label: getLabel('propertyType', 'terraced') },
    { value: 'flat', label: getLabel('propertyType', 'flat') },
    { value: 'bungalow', label: getLabel('propertyType', 'bungalow') },
  ];

  return (
    <>
      <a href="#" className="govuk-back-link" onClick={(e) => { e.preventDefault(); handleBack(); }}>
        Back
      </a>

      <ErrorSummary errors={errors} />

      <RadioGroup
        name="propertyType"
        legend="What type of property do you live in?"
        options={options}
        value={answers.propertyType}
        onChange={(value) => onAnswer('propertyType', value)}
        error={errors.find(e => e.fieldId === 'propertyType')?.message}
      />

      <GovukButton onClick={handleContinue}>Continue</GovukButton>
    </>
  );
}

export default PropertyTypePage;
