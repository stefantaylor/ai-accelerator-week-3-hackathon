import { useNavigate } from 'react-router-dom';
import GovukButton from '../components/GovukButton';
import { useLanguage } from '../content/language.jsx';

function StartPage({ answers, onAnswer }) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  document.title = t('titleSuffix');

  const handleStart = () => {
    navigate('/prior-grants');
  };

  return (
    <>
      <h1 className="govuk-heading-xl">
        {t('serviceName')}
      </h1>
      <p className="govuk-body-l">
        {t('start.intro')}
      </p>
      <GovukButton variant="start" onClick={handleStart}>
        {t('start.button')}
      </GovukButton>
    </>
  );
}

export default StartPage;
