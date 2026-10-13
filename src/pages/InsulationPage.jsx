import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import CheckboxGroup from '../components/CheckboxGroup';
import ErrorSummary from '../components/ErrorSummary';
import GovukButton from '../components/GovukButton';
import { isAnswered } from '../state/answers.js';
import { getLabel } from '../content/labels.js';
import { useLanguage } from '../content/language.jsx';
import { continueRoute, backRoute } from '../flow/journey.js';

function InsulationPage({ answers, onAnswer }) {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [errors, setErrors] = useState([]);

  const hasError = errors.length > 0;
  document.title = `${hasError ? `${t('errorPrefix')} ` : ''}${t('insulation.question')} - ${t('titleSuffix')}`;

  const handleContinue = () => {
    if (!isAnswered('uninsulatedParts', answers.uninsulatedParts)) {
      setErrors([{ fieldId: 'uninsulatedParts', messageKey: 'insulation.error' }]);
      return;
    }

    setErrors([]);
    onAnswer('uninsulatedParts', answers.uninsulatedParts);
    navigate(continueRoute('/insulation', answers, searchParams.get('change') === 'true'));
  };

  const handleBack = () => {
    navigate(backRoute('/insulation', answers));
  };

  const options = [
    { value: 'loft', label: getLabel('uninsulatedParts', 'loft', lang) },
    { value: 'walls', label: getLabel('uninsulatedParts', 'walls', lang) },
    { value: 'floor', label: getLabel('uninsulatedParts', 'floor', lang) },
    { value: 'allInsulated', label: getLabel('uninsulatedParts', 'allInsulated', lang) },
    { value: 'notSure', label: getLabel('uninsulatedParts', 'notSure', lang) },
  ];

  return (
    <>
      <a href="#" className="govuk-back-link" onClick={(e) => { e.preventDefault(); handleBack(); }}>
        {t('back')}
      </a>

      <ErrorSummary errors={errors} />

      <CheckboxGroup
        name="uninsulatedParts"
        legend={t('insulation.question')}
        hint={t('selectAllThatApply')}
        options={options}
        value={answers.uninsulatedParts}
        onChange={(values) => onAnswer('uninsulatedParts', values)}
        error={hasError ? t('insulation.error') : undefined}
        exclusive={['allInsulated', 'notSure']}
        dividerBefore={[3]}
      />

      <GovukButton onClick={handleContinue}>{t('continue')}</GovukButton>
    </>
  );
}

export default InsulationPage;
