import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import CheckboxGroup from '../components/CheckboxGroup';
import ErrorSummary from '../components/ErrorSummary';
import GovukButton from '../components/GovukButton';
import { isAnswered, ALLOWED_VALUES } from '../state/answers.js';
import { getLabel } from '../content/labels.js';
import { continueRoute, backRoute } from '../flow/journey.js';
import { usePageTitle } from '../hooks/usePageTitle.js';

const FIELD = 'uninsulatedParts';
const ROUTE = '/insulation';
const QUESTION = 'Which parts of your property are not insulated?';
const ERROR_MESSAGE = 'Select which parts of your property are not insulated, or select \'All parts are insulated\' or \'I\'m not sure\'';

const options = ALLOWED_VALUES[FIELD].map(value => ({ value, label: getLabel(FIELD, value) }));

function InsulationPage({ answers, onAnswer }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [errors, setErrors] = useState([]);

  usePageTitle(QUESTION, errors.length > 0);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!isAnswered(FIELD, answers[FIELD])) {
      setErrors([{ fieldId: FIELD, message: ERROR_MESSAGE }]);
      return;
    }

    setErrors([]);
    navigate(continueRoute(ROUTE, answers, searchParams.get('change') === 'true'));
  };

  return (
    <>
      <Link to={backRoute(ROUTE, answers)} className="govuk-back-link">Back</Link>

      <ErrorSummary errors={errors} />

      <form onSubmit={handleSubmit} noValidate>
        <CheckboxGroup
          name={FIELD}
          legend={QUESTION}
          hint="Select all that apply"
          options={options}
          value={answers[FIELD]}
          onChange={(values) => onAnswer(FIELD, values)}
          error={errors.find(e => e.fieldId === FIELD)?.message}
          exclusive={['allInsulated', 'notSure']}
          dividerBefore={[3]}
        />

        <GovukButton type="submit">Continue</GovukButton>
      </form>
    </>
  );
}

export default InsulationPage;
