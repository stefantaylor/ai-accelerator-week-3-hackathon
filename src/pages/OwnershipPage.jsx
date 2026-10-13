import QuestionPage from './QuestionPage';
import { OWNERSHIP_OPTIONS } from '../content/labels';

function OwnershipPage(props) {
  return (
    <QuestionPage
      {...props}
      route="/ownership"
      field="ownership"
      control="radio"
      question="Do you own or rent your property?"
      options={OWNERSHIP_OPTIONS}
      errorMessage="Select if you own or rent your property"
    />
  );
}

export default OwnershipPage;
