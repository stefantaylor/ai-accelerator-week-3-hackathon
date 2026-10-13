import QuestionPage from './QuestionPage';
import { HEATING_OPTIONS } from '../content/labels';

function HeatingPage(props) {
  return (
    <QuestionPage
      {...props}
      route="/heating"
      field="heating"
      control="radio"
      question="What is your main heating system?"
      options={HEATING_OPTIONS}
      errorMessage="Select your main heating system"
    />
  );
}

export default HeatingPage;
