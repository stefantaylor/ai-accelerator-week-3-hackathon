import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import CheckboxGroup from '../components/CheckboxGroup';
import ErrorSummary from '../components/ErrorSummary';
import GovukButton from '../components/GovukButton';
import { isAnswered, ALLOWED_VALUES } from '../state/answers.js';
import { getLabel } from '../content/labels.js';
import { continueRoute, backRoute } from '../flow/journey.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useLanguage } from '../content/language.jsx';

const FIELD = 'uninsulatedParts';
const ROUTE = '/insulation';

function InsulationPage({ answers, onAnswer }) {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [errors, setErrors] = useState([]);

  const hasError = errors.length > 0;
  const question = t('insulation.question');
  usePageTitle(question, hasError);

  const options = ALLOWED_VALUES[FIELD].map(value => ({ value, label: getLabel(FIELD, value, lang) }));

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!isAnswered(FIELD, answers[FIELD])) {
      setErrors([{ fieldId: FIELD, messageKey: 'insulation.error' }]);
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
        <CheckboxGroup
          name={FIELD}
          legend={question}
          hint={t('selectAllThatApply')}
          options={options}
          value={answers[FIELD]}
          onChange={(values) => onAnswer(FIELD, values)}
          error={hasError ? t('insulation.error') : undefined}
          exclusive={['allInsulated', 'notSure']}
          dividerBefore={[3]}
        />

        <GovukButton type="submit">{t('continue')}</GovukButton>
      </form>
    </>
  );
}

export default InsulationPage;
