import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import RadioGroup from '../components/RadioGroup';
import ErrorSummary from '../components/ErrorSummary';
import GovukButton from '../components/GovukButton';
import { isAnswered } from '../state/answers.js';
import { getLabel } from '../content/labels.js';
import { useLanguage } from '../content/language.jsx';
import { continueRoute, backRoute } from '../flow/journey.js';

function HeatingPage({ answers, onAnswer }) {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [errors, setErrors] = useState([]);

  const hasError = errors.length > 0;
  document.title = `${hasError ? `${t('errorPrefix')} ` : ''}${t('heating.question')} - ${t('titleSuffix')}`;

  const handleContinue = () => {
    if (!isAnswered('heating', answers.heating)) {
      setErrors([{ fieldId: 'heating', messageKey: 'heating.error' }]);
      return;
    }

    setErrors([]);
    onAnswer('heating', answers.heating);
    navigate(continueRoute('/heating', answers, searchParams.get('change') === 'true'));
  };

  const handleBack = () => {
    navigate(backRoute('/heating', answers));
  };

  const options = [
    { value: 'gasBoiler', label: getLabel('heating', 'gasBoiler', lang) },
    { value: 'oilBoiler', label: getLabel('heating', 'oilBoiler', lang) },
    { value: 'electric', label: getLabel('heating', 'electric', lang) },
    { value: 'heatPump', label: getLabel('heating', 'heatPump', lang) },
    { value: 'other', label: getLabel('heating', 'other', lang) },
  ];

  return (
    <>
      <a href="#" className="govuk-back-link" onClick={(e) => { e.preventDefault(); handleBack(); }}>
        {t('back')}
      </a>

      <ErrorSummary errors={errors} />

      <RadioGroup
        name="heating"
        legend={t('heating.question')}
        options={options}
        value={answers.heating}
        onChange={(value) => onAnswer('heating', value)}
        error={hasError ? t('heating.error') : undefined}
      />

      <GovukButton onClick={handleContinue}>{t('continue')}</GovukButton>
    </>
  );
}

export default HeatingPage;
