import { useNavigate } from 'react-router-dom';
import GovukButton from '../components/GovukButton';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useLanguage } from '../content/language.jsx';

function StartPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  usePageTitle('');

  return (
    <>
      <h1 className="govuk-heading-xl">
        {t('serviceName')}
      </h1>
      <p className="govuk-body-l">
        {t('start.intro')}
      </p>
      <GovukButton variant="start" onClick={() => navigate('/prior-grants')}>
        {t('start.button')}
      </GovukButton>
    </>
  );
}

export default StartPage;
