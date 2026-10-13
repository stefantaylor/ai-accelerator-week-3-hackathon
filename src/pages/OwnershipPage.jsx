import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import RadioGroup from '../components/RadioGroup';
import ErrorSummary from '../components/ErrorSummary';
import GovukButton from '../components/GovukButton';
import { isAnswered } from '../state/answers.js';
import { getLabel } from '../content/labels.js';
import { useLanguage } from '../content/language.jsx';
import { continueRoute, backRoute } from '../flow/journey.js';

function OwnershipPage({ answers, onAnswer }) {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [errors, setErrors] = useState([]);

  const hasError = errors.length > 0;
  document.title = `${hasError ? `${t('errorPrefix')} ` : ''}${t('ownership.question')} - ${t('titleSuffix')}`;

  const handleContinue = () => {
    if (!isAnswered('ownership', answers.ownership)) {
      setErrors([{ fieldId: 'ownership', messageKey: 'ownership.error' }]);
      return;
    }

    setErrors([]);
    onAnswer('ownership', answers.ownership);
    navigate(continueRoute('/ownership', answers, searchParams.get('change') === 'true'));
  };

  const handleBack = () => {
    navigate(backRoute('/ownership', answers));
  };

  const options = [
    { value: 'ownOutright', label: getLabel('ownership', 'ownOutright', lang) },
    { value: 'mortgage', label: getLabel('ownership', 'mortgage', lang) },
    { value: 'sharedOwnership', label: getLabel('ownership', 'sharedOwnership', lang) },
    { value: 'rent', label: getLabel('ownership', 'rent', lang) },
  ];

  return (
    <>
      <a href="#" className="govuk-back-link" onClick={(e) => { e.preventDefault(); handleBack(); }}>
        {t('back')}
      </a>

      <ErrorSummary errors={errors} />

      <RadioGroup
        name="ownership"
        legend={t('ownership.question')}
        options={options}
        value={answers.ownership}
        onChange={(value) => onAnswer('ownership', value)}
        error={hasError ? t('ownership.error') : undefined}
      />

      <GovukButton onClick={handleContinue}>{t('continue')}</GovukButton>
    </>
  );
}

export default OwnershipPage;
