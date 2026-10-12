import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import RadioGroup from '../components/RadioGroup';
import ErrorSummary from '../components/ErrorSummary';
import GovukButton from '../components/GovukButton';
import { isAnswered } from '../state/answers.js';
import { getLabel } from '../content/labels.js';
import { continueRoute, backRoute } from '../flow/journey.js';

function OwnershipPage({ answers, onAnswer }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [errors, setErrors] = useState([]);

  document.title = `${errors.length ? 'Error: ' : ''}Do you own or rent your property? - Check if you can get a Green Home Grant - GOV.UK`;

  const handleContinue = () => {
    if (!isAnswered('ownership', answers.ownership)) {
      setErrors([{ fieldId: 'ownership', message: 'Select if you own or rent your property' }]);
      return;
    }

    setErrors([]);
    onAnswer('ownership', answers.ownership);
    navigate(continueRoute('/ownership', answers, searchParams.get('change') === 'true'));
  };

  const handleBack = () => {
    navigate(backRoute('/ownership', answers));
  };

  const options = [
    { value: 'ownOutright', label: getLabel('ownership', 'ownOutright') },
    { value: 'mortgage', label: getLabel('ownership', 'mortgage') },
    { value: 'sharedOwnership', label: getLabel('ownership', 'sharedOwnership') },
    { value: 'rent', label: getLabel('ownership', 'rent') },
  ];

  return (
    <>
      <a href="#" className="govuk-back-link" onClick={(e) => { e.preventDefault(); handleBack(); }}>
        Back
      </a>

      <ErrorSummary errors={errors} />

      <RadioGroup
        name="ownership"
        legend="Do you own or rent your property?"
        options={options}
        value={answers.ownership}
        onChange={(value) => onAnswer('ownership', value)}
        error={errors.find(e => e.fieldId === 'ownership')?.message}
      />

      <GovukButton onClick={handleContinue}>Continue</GovukButton>
    </>
  );
}

export default OwnershipPage;
