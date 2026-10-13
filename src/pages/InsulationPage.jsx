import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CheckboxGroup from '../components/CheckboxGroup';
import ErrorSummary from '../components/ErrorSummary';
import GovukButton from '../components/GovukButton';
import { isAnswered } from '../state/answers.js';
import { getLabel } from '../content/labels.js';
import { continueRoute, backRoute } from '../flow/journey.js';

function InsulationPage({ answers, onAnswer }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [errors, setErrors] = useState([]);

  document.title = `${errors.length ? 'Error: ' : ''}Which parts of your property are not insulated? - Check if you can get a Green Home Grant - GOV.UK`;

  const handleContinue = () => {
    if (!isAnswered('uninsulatedParts', answers.uninsulatedParts)) {
      setErrors([{ fieldId: 'uninsulatedParts', message: 'Select which parts of your property are not insulated, or select \'All parts are insulated\' or \'I\'m not sure\'' }]);
      return;
    }

    setErrors([]);
    onAnswer('uninsulatedParts', answers.uninsulatedParts);
    navigate(continueRoute('/insulation', answers, searchParams.get('change') === 'true'));
  };

  const handleBack = () => {
    navigate(backRoute('/insulation', answers));
  };

  const options = [
    { value: 'loft', label: getLabel('uninsulatedParts', 'loft') },
    { value: 'walls', label: getLabel('uninsulatedParts', 'walls') },
    { value: 'floor', label: getLabel('uninsulatedParts', 'floor') },
    { value: 'allInsulated', label: getLabel('uninsulatedParts', 'allInsulated') },
    { value: 'notSure', label: getLabel('uninsulatedParts', 'notSure') },
  ];

  return (
    <>
      <a href="#" className="govuk-back-link" onClick={(e) => { e.preventDefault(); handleBack(); }}>
        Back
      </a>

      <ErrorSummary errors={errors} />

      <CheckboxGroup
        name="uninsulatedParts"
        legend="Which parts of your property are not insulated?"
        hint="Select all that apply"
        options={options}
        value={answers.uninsulatedParts}
        onChange={(values) => onAnswer('uninsulatedParts', values)}
        error={errors.find(e => e.fieldId === 'uninsulatedParts')?.message}
        exclusive={['allInsulated', 'notSure']}
        dividerBefore={[3]}
      />

      <GovukButton onClick={handleContinue}>Continue</GovukButton>
    </>
  );
}

export default InsulationPage;
