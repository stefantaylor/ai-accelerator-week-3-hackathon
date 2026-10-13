import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import RadioGroup from '../components/RadioGroup';
import ErrorSummary from '../components/ErrorSummary';
import GovukButton from '../components/GovukButton';
import { isAnswered, ALLOWED_VALUES } from '../state/answers.js';
import { getLabel } from '../content/labels.js';
import { continueRoute, backRoute } from '../flow/journey.js';
import { usePageTitle } from '../hooks/usePageTitle.js';

const FIELD = 'incomeBand';
const ROUTE = '/income';
const QUESTION = 'What is your annual household income?';
const ERROR_MESSAGE = 'Select your annual household income';

const options = ALLOWED_VALUES[FIELD].map(value => ({ value, label: getLabel(FIELD, value) }));

function IncomePage({ answers, onAnswer }) {
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
        <RadioGroup
          name={FIELD}
          legend={QUESTION}
          options={options}
          value={answers[FIELD]}
          onChange={(value) => onAnswer(FIELD, value)}
          error={errors.find(e => e.fieldId === FIELD)?.message}
        />

        <GovukButton type="submit">Continue</GovukButton>
      </form>
    </>
  );
}

export default IncomePage;
