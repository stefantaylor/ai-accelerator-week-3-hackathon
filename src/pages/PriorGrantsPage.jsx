import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CheckboxGroup from '../components/CheckboxGroup';
import ErrorSummary from '../components/ErrorSummary';
import GovukButton from '../components/GovukButton';
import { isAnswered } from '../state/answers.js';
import { getLabel } from '../content/labels.js';
import { nextRoute, firstIncompleteRoute, isJourneyComplete } from '../flow/journey.js';

export default function PriorGrantsPage({ answers, onAnswer }) {
  const navigate = useNavigate();
  const [errors, setErrors] = useState([]);

  // Set document title
  const hasErrors = errors.length > 0;
  document.title = `${hasErrors ? 'Error: ' : ''}Have you received a Green Home Grant before? - Check if you can get a Green Home Grant - GOV.UK`;

  const handleContinue = () => {
    // Validate
    if (!isAnswered('priorGrants', answers.priorGrants)) {
      setErrors([{ fieldId: 'priorGrants', message: 'Select if you have received a Green Home Grant before' }]);
      return;
    }

    setErrors([]);
    onAnswer('priorGrants', answers.priorGrants);

    // Check for early exit: both grants already received
    if (answers.priorGrants.includes('insulation') && answers.priorGrants.includes('heatPump')) {
      navigate('/result');
    } else {
      navigate(nextRoute('/prior-grants', answers));
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleCheckboxChange = (values) => {
    onAnswer('priorGrants', values);
  };

  const options = [
    { value: 'insulation', label: getLabel('priorGrants', 'insulation') },
    { value: 'heatPump', label: getLabel('priorGrants', 'heatPump') },
    { value: 'none', label: getLabel('priorGrants', 'none') },
  ];

  return (
    <>
      <a href="/" className="govuk-back-link" onClick={(e) => { e.preventDefault(); handleBack(); }}>
        Back
      </a>

      <ErrorSummary errors={errors} />

      <CheckboxGroup
        name="priorGrants"
        legend="Have you received a Green Home Grant before?"
        hint="Select all that apply"
        options={options}
        value={answers.priorGrants}
        onChange={handleCheckboxChange}
        error={errors.find(e => e.fieldId === 'priorGrants')?.message}
        exclusive={['none']}
        dividerBefore={[2]}
        dividerLabel="or"
      />

      <GovukButton onClick={handleContinue}>Continue</GovukButton>
    </>
  );
}
