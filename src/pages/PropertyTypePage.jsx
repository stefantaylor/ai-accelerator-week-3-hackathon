import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import RadioGroup from '../components/RadioGroup';
import ErrorSummary from '../components/ErrorSummary';
import GovukButton from '../components/GovukButton';
import { isAnswered } from '../state/answers.js';
import { getLabel } from '../content/labels.js';
import { useLanguage } from '../content/language.jsx';
import { continueRoute, backRoute } from '../flow/journey.js';

function PropertyTypePage({ answers, onAnswer }) {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [errors, setErrors] = useState([]);

  const hasError = errors.length > 0;
  document.title = `${hasError ? `${t('errorPrefix')} ` : ''}${t('propertyType.question')} - ${t('titleSuffix')}`;

  const handleContinue = () => {
    if (!isAnswered('propertyType', answers.propertyType)) {
      setErrors([{ fieldId: 'propertyType', messageKey: 'propertyType.error' }]);
      return;
    }

    setErrors([]);
    onAnswer('propertyType', answers.propertyType);
    navigate(continueRoute('/property-type', answers, searchParams.get('change') === 'true'));
  };

  const handleBack = () => {
    navigate(backRoute('/property-type', answers));
  };

  const options = [
    { value: 'detached', label: getLabel('propertyType', 'detached', lang) },
    { value: 'semiDetached', label: getLabel('propertyType', 'semiDetached', lang) },
    { value: 'terraced', label: getLabel('propertyType', 'terraced', lang) },
    { value: 'flat', label: getLabel('propertyType', 'flat', lang) },
    { value: 'bungalow', label: getLabel('propertyType', 'bungalow', lang) },
  ];

  return (
    <>
      <a href="#" className="govuk-back-link" onClick={(e) => { e.preventDefault(); handleBack(); }}>
        {t('back')}
      </a>

      <ErrorSummary errors={errors} />

      <RadioGroup
        name="propertyType"
        legend={t('propertyType.question')}
        options={options}
        value={answers.propertyType}
        onChange={(value) => onAnswer('propertyType', value)}
        error={hasError ? t('propertyType.error') : undefined}
      />

      <GovukButton onClick={handleContinue}>{t('continue')}</GovukButton>
    </>
  );
}

export default PropertyTypePage;
