import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import RadioGroup from '../components/RadioGroup';
import ErrorSummary from '../components/ErrorSummary';
import GovukButton from '../components/GovukButton';
import { isAnswered, ALLOWED_VALUES } from '../state/answers.js';
import { getLabel } from '../content/labels.js';
import { continueRoute, backRoute } from '../flow/journey.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useLanguage } from '../content/language.jsx';

const FIELD = 'consent';
const ROUTE = '/consent';

export default function ConsentPage({ answers, onAnswer }) {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [errors, setErrors] = useState([]);

  const isSharedOwnership = answers.ownership === 'sharedOwnership';
  const question = t(isSharedOwnership ? 'consent.sharedQuestion' : 'consent.rentQuestion');
  const errorKey = isSharedOwnership ? 'consent.sharedError' : 'consent.rentError';
  const hasError = errors.length > 0;
  usePageTitle(question, hasError);

  const options = ALLOWED_VALUES[FIELD].map(value => ({ value, label: getLabel(FIELD, value, lang) }));

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!isAnswered(FIELD, answers[FIELD])) {
      setErrors([{ fieldId: FIELD, messageKey: errorKey }]);
      return;
    }

    setErrors([]);
    navigate(continueRoute(ROUTE, answers, searchParams.get('change') === 'true'));
  };

  return (
    <>
      <Link to={backRoute(ROUTE, answers)} className="govuk-back-link">{t('back')}</Link>

      <ErrorSummary errors={errors} />

      <form onSubmit={handleSubmit} noValidate>
        <RadioGroup
          name={FIELD}
          legend={question}
          options={options}
          value={answers[FIELD]}
          onChange={(value) => onAnswer(FIELD, value)}
          error={hasError ? t(errorKey) : undefined}
        />

        <GovukButton type="submit">{t('continue')}</GovukButton>
      </form>
    </>
  );
}
