import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import CheckboxGroup from '../components/CheckboxGroup';
import ErrorSummary from '../components/ErrorSummary';
import GovukButton from '../components/GovukButton';
import { isAnswered, ALLOWED_VALUES } from '../state/answers.js';
import { getLabel } from '../content/labels.js';
import { continueRoute } from '../flow/journey.js';
import { usePageTitle } from '../hooks/usePageTitle.js';

const FIELD = 'priorGrants';
const ROUTE = '/prior-grants';
const QUESTION = 'Have you received a Green Home Grant before?';
const ERROR_MESSAGE = 'Select if you have received a Green Home Grant before';

const options = ALLOWED_VALUES[FIELD].map(value => ({ value, label: getLabel(FIELD, value) }));

export default function PriorGrantsPage({ answers, onAnswer }) {
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
    // continueRoute goes straight to /result when both grants were already received
    navigate(continueRoute(ROUTE, answers, searchParams.get('change') === 'true'));
  };

  return (
    <>
      <Link to="/" className="govuk-back-link">Back</Link>

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
          exclusive={['none']}
          dividerBefore={[2]}
          dividerLabel="or"
        />

        <GovukButton type="submit">Continue</GovukButton>
      </form>
    </>
  );
}
