import QuestionPage from './QuestionPage';
import { INCOME_OPTIONS } from '../content/labels';

function IncomePage(props) {
  return (
    <QuestionPage
      {...props}
      route="/income"
      field="incomeBand"
      control="radio"
      question="What is your annual household income?"
      options={INCOME_OPTIONS}
      errorMessage="Select your annual household income"
    />
  );
}

export default IncomePage;
