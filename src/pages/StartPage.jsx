import { useNavigate } from 'react-router-dom';
import GovukButton from '../components/GovukButton';
import usePageTitle from '../components/usePageTitle';
import { nextRoute } from '../flow/journey';

function StartPage() {
  const navigate = useNavigate();
  usePageTitle('Check if you can get a Green Home Grant');

  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds">
        <h1 className="govuk-heading-xl">Check if you can get a Green Home Grant</h1>
        <p className="govuk-body-l">
          Use this service to check if you can get a Green Home Grant for insulation or a heat pump, and how much of
          the cost it could cover.
        </p>
        <p className="govuk-body">You will need to know:</p>
        <ul className="govuk-list govuk-list--bullet">
          <li>if you have had a Green Home Grant before</li>
          <li>if you own or rent your property</li>
          <li>your annual household income</li>
          <li>which parts of your property are not insulated</li>
          <li>how your property is heated</li>
        </ul>
        <p className="govuk-body">
          This is a check, not an application. We delete your answers when you see your result, or if you do not do
          anything for 10 minutes.
        </p>
        <GovukButton variant="start" onClick={() => navigate(nextRoute('/', {}))}>
          Start now
        </GovukButton>
      </div>
    </div>
  );
}

export default StartPage;
