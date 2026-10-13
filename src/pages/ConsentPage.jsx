import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import RadioGroup from '../components/RadioGroup';
import ErrorSummary from '../components/ErrorSummary';
import GovukButton from '../components/GovukButton';
import { isAnswered } from '../state/answers.js';
import { getLabel } from '../content/labels.js';
import { continueRoute, backRoute } from '../flow/journey.js';

export default function ConsentPage({ answers, onAnswer }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [errors, setErrors] = useState([]);

  const isSharedOwnership = answers.ownership === 'sharedOwnership';
  const legend = isSharedOwnership
    ? 'Do all owners of the property agree to the work?'
    : 'Do you have your landlord\'s permission for the work?';

  const errorMessage = isSharedOwnership
    ? 'Select yes if all owners agree to the work'
    : 'Select yes if you have your landlord\'s permission';

  // Set document title
  const hasErrors = errors.length > 0;
  document.title = `${hasErrors ? 'Error: ' : ''}${legend} - Check if you can get a Green Home Grant - GOV.UK`;

  const handleContinue = () => {
    // Validate
    if (!isAnswered('consent', answers.consent)) {
      setErrors([{ fieldId: 'consent', message: errorMessage }]);
      return;
    }

    setErrors([]);
    onAnswer('consent', answers.consent);
    navigate(continueRoute('/consent', answers, searchParams.get('change') === 'true'));
  };

  const handleBack = () => {
    navigate(backRoute('/consent', answers));
  };

  const options = [
    { value: 'yes', label: getLabel('consent', 'yes') },
    { value: 'no', label: getLabel('consent', 'no') },
  ];

  return (
    <>
      <a href="#" className="govuk-back-link" onClick={(e) => { e.preventDefault(); handleBack(); }}>
        Back
      </a>

      <ErrorSummary errors={errors} />

      <RadioGroup
        name="consent"
        legend={legend}
        options={options}
        value={answers.consent}
        onChange={(value) => onAnswer('consent', value)}
        error={errors.find(e => e.fieldId === 'consent')?.message}
      />

      <GovukButton onClick={handleContinue}>Continue</GovukButton>
    </>
  );
}
