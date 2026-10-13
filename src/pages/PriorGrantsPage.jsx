import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CheckboxGroup from '../components/CheckboxGroup';
import ErrorSummary from '../components/ErrorSummary';
import GovukButton from '../components/GovukButton';
import { isAnswered } from '../state/answers.js';
import { getLabel } from '../content/labels.js';
import { useLanguage } from '../content/language.jsx';
import { continueRoute, firstIncompleteRoute, isJourneyComplete } from '../flow/journey.js';

export default function PriorGrantsPage({ answers, onAnswer }) {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [errors, setErrors] = useState([]);

  // Set document title
  const hasErrors = errors.length > 0;
  document.title = `${hasErrors ? `${t('errorPrefix')} ` : ''}${t('priorGrants.question')} - ${t('titleSuffix')}`;

  const handleContinue = () => {
    // Validate
    if (!isAnswered('priorGrants', answers.priorGrants)) {
      setErrors([{ fieldId: 'priorGrants', messageKey: 'priorGrants.error' }]);
      return;
    }

    setErrors([]);
    onAnswer('priorGrants', answers.priorGrants);

    // Check for early exit: both grants already received
    if (answers.priorGrants.includes('insulation') && answers.priorGrants.includes('heatPump')) {
      navigate('/result');
    } else {
      navigate(continueRoute('/prior-grants', answers, searchParams.get('change') === 'true'));
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const handleCheckboxChange = (values) => {
    onAnswer('priorGrants', values);
  };

  const options = [
    { value: 'insulation', label: getLabel('priorGrants', 'insulation', lang) },
    { value: 'heatPump', label: getLabel('priorGrants', 'heatPump', lang) },
    { value: 'none', label: getLabel('priorGrants', 'none', lang) },
  ];

  return (
    <>
      <a href="/" className="govuk-back-link" onClick={(e) => { e.preventDefault(); handleBack(); }}>
        {t('back')}
      </a>

      <ErrorSummary errors={errors} />

      <CheckboxGroup
        name="priorGrants"
        legend={t('priorGrants.question')}
        hint={t('selectAllThatApply')}
        options={options}
        value={answers.priorGrants}
        onChange={handleCheckboxChange}
        error={hasErrors ? t('priorGrants.error') : undefined}
        exclusive={['none']}
        dividerBefore={[2]}
      />

      <GovukButton onClick={handleContinue}>{t('continue')}</GovukButton>
    </>
  );
}
