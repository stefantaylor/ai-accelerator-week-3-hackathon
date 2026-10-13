import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import RadioGroup from '../components/RadioGroup';
import ErrorSummary from '../components/ErrorSummary';
import GovukButton from '../components/GovukButton';
import { isAnswered } from '../state/answers.js';
import { getLabel } from '../content/labels.js';
import { useLanguage } from '../content/language.jsx';
import { continueRoute, backRoute } from '../flow/journey.js';

export default function ConsentPage({ answers, onAnswer }) {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [errors, setErrors] = useState([]);

  const isSharedOwnership = answers.ownership === 'sharedOwnership';
  const legend = t(isSharedOwnership ? 'consent.sharedQuestion' : 'consent.rentQuestion');
  const errorKey = isSharedOwnership ? 'consent.sharedError' : 'consent.rentError';

  // Set document title
  const hasErrors = errors.length > 0;
  document.title = `${hasErrors ? `${t('errorPrefix')} ` : ''}${legend} - ${t('titleSuffix')}`;

  const handleContinue = () => {
    // Validate
    if (!isAnswered('consent', answers.consent)) {
      setErrors([{ fieldId: 'consent', messageKey: errorKey }]);
      return;
    }

    setErrors([]);
    onAnswer('consent', answers.consent);
    navigate(continueRoute('/consent', answers, searchParams.get('change') === 'true'));
  };

  const handleBack = () => {
    navigate(backRoute('/consent', answers));
  };

  const options = [
    { value: 'yes', label: getLabel('consent', 'yes', lang) },
    { value: 'no', label: getLabel('consent', 'no', lang) },
  ];

  return (
    <>
      <a href="#" className="govuk-back-link" onClick={(e) => { e.preventDefault(); handleBack(); }}>
        {t('back')}
      </a>

      <ErrorSummary errors={errors} />

      <RadioGroup
        name="consent"
        legend={legend}
        options={options}
        value={answers.consent}
        onChange={(value) => onAnswer('consent', value)}
        error={hasErrors ? t(errorKey) : undefined}
      />

      <GovukButton onClick={handleContinue}>{t('continue')}</GovukButton>
    </>
  );
}
