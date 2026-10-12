import { useNavigate } from 'react-router-dom';
import GovukButton from '../components/GovukButton';

function StartPage({ answers, onAnswer }) {
  const navigate = useNavigate();
  document.title = 'Check if you can get a Green Home Grant - GOV.UK';

  const handleStart = () => {
    navigate('/prior-grants');
  };

  return (
    <>
      <h1 className="govuk-heading-xl">
        Check if you can get a Green Home Grant
      </h1>
      <p className="govuk-body-l">
        Use this tool to check whether you might be eligible for a Green Home Grant to help with the cost of insulation or a heat pump.
      </p>
      <GovukButton variant="start" onClick={handleStart}>
        Start now
      </GovukButton>
    </>
  );
}

export default StartPage;
