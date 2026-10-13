import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import RadioGroup from '../components/RadioGroup';
import ErrorSummary from '../components/ErrorSummary';
import GovukButton from '../components/GovukButton';
import { isAnswered } from '../state/answers.js';
import { getLabel } from '../content/labels.js';
import { useLanguage } from '../content/language.jsx';
import { continueRoute, backRoute } from '../flow/journey.js';

function IncomePage({ answers, onAnswer }) {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [errors, setErrors] = useState([]);

  const hasError = errors.length > 0;
  document.title = `${hasError ? `${t('errorPrefix')} ` : ''}${t('income.question')} - ${t('titleSuffix')}`;

  const handleContinue = () => {
    if (!isAnswered('incomeBand', answers.incomeBand)) {
      setErrors([{ fieldId: 'incomeBand', messageKey: 'income.error' }]);
      return;
    }

    setErrors([]);
    onAnswer('incomeBand', answers.incomeBand);
    navigate(continueRoute('/income', answers, searchParams.get('change') === 'true'));
  };

  const handleBack = () => {
    navigate(backRoute('/income', answers));
  };

  const options = [
    { value: 'under12570', label: getLabel('incomeBand', 'under12570', lang) },
    { value: '12571to50270', label: getLabel('incomeBand', '12571to50270', lang) },
    { value: '50271to125140', label: getLabel('incomeBand', '50271to125140', lang) },
    { value: 'over125141', label: getLabel('incomeBand', 'over125141', lang) },
  ];

  return (
    <>
      <a href="#" className="govuk-back-link" onClick={(e) => { e.preventDefault(); handleBack(); }}>
        {t('back')}
      </a>

      <ErrorSummary errors={errors} />

      <RadioGroup
        name="incomeBand"
        legend={t('income.question')}
        options={options}
        value={answers.incomeBand}
        onChange={(value) => onAnswer('incomeBand', value)}
        error={hasError ? t('income.error') : undefined}
      />

      <GovukButton onClick={handleContinue}>{t('continue')}</GovukButton>
    </>
  );
}

export default IncomePage;
