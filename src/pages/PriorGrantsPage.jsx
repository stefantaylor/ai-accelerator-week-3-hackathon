import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import CheckboxGroup from '../components/CheckboxGroup';
import ErrorSummary from '../components/ErrorSummary';
import GovukButton from '../components/GovukButton';
import { isAnswered, ALLOWED_VALUES } from '../state/answers.js';
import { getLabel } from '../content/labels.js';
import { continueRoute } from '../flow/journey.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useLanguage } from '../content/language.jsx';

const FIELD = 'priorGrants';
const ROUTE = '/prior-grants';

export default function PriorGrantsPage({ answers, onAnswer }) {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [errors, setErrors] = useState([]);

  const hasError = errors.length > 0;
  const question = t('priorGrants.question');
  usePageTitle(question, hasError);

  const options = ALLOWED_VALUES[FIELD].map(value => ({ value, label: getLabel(FIELD, value, lang) }));

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!isAnswered(FIELD, answers[FIELD])) {
      setErrors([{ fieldId: FIELD, messageKey: 'priorGrants.error' }]);
      return;
    }

    setErrors([]);
    // continueRoute goes straight to /result when both grants were already received
    navigate(continueRoute(ROUTE, answers, searchParams.get('change') === 'true'));
  };

  return (
    <>
      <Link to="/" className="govuk-back-link">{t('back')}</Link>

      <ErrorSummary errors={errors} />

      <form onSubmit={handleSubmit} noValidate>
        <CheckboxGroup
          name={FIELD}
          legend={question}
          hint={t('selectAllThatApply')}
          options={options}
          value={answers[FIELD]}
          onChange={(values) => onAnswer(FIELD, values)}
          error={hasError ? t('priorGrants.error') : undefined}
          exclusive={['none']}
          dividerBefore={[2]}
        />

        <GovukButton type="submit">{t('continue')}</GovukButton>
      </form>
    </>
  );
}
