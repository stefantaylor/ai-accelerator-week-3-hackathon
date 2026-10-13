import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import RadioGroup from '../components/RadioGroup';
import ErrorSummary from '../components/ErrorSummary';
import GovukButton from '../components/GovukButton';
import { isAnswered, ALLOWED_VALUES } from '../state/answers.js';
import { getLabel } from '../content/labels.js';
import { continueRoute, backRoute } from '../flow/journey.js';
import { usePageTitle } from '../hooks/usePageTitle.js';

const FIELD = 'consent';
const ROUTE = '/consent';

const options = ALLOWED_VALUES[FIELD].map(value => ({ value, label: getLabel(FIELD, value) }));

export default function ConsentPage({ answers, onAnswer }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [errors, setErrors] = useState([]);

  const isSharedOwnership = answers.ownership === 'sharedOwnership';
  const question = isSharedOwnership
    ? 'Do all owners of the property agree to the work?'
    : 'Do you have your landlord\'s permission for the work?';
  const errorMessage = isSharedOwnership
    ? 'Select yes if all owners agree to the work'
    : 'Select yes if you have your landlord\'s permission';

  usePageTitle(question, errors.length > 0);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!isAnswered(FIELD, answers[FIELD])) {
      setErrors([{ fieldId: FIELD, message: errorMessage }]);
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
          legend={question}
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
