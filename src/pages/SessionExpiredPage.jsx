import { useNavigate } from 'react-router-dom';
import GovukButton from '../components/GovukButton';
import usePageTitle from '../components/usePageTitle';

export default function SessionExpiredPage() {
  const navigate = useNavigate();
  usePageTitle('Your answers have been deleted');

  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds">
        <h1 className="govuk-heading-l">Your answers have been deleted</h1>
        <p className="govuk-body">
          You did not do anything for 10 minutes, so we deleted your answers to protect your information.
        </p>
        <GovukButton onClick={() => navigate('/')}>Start again</GovukButton>
      </div>
    </div>
  );
}
