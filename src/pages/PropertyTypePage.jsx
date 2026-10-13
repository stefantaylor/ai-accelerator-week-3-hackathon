import QuestionPage from './QuestionPage';
import { PROPERTY_TYPE_OPTIONS } from '../content/labels';

function PropertyTypePage(props) {
  return (
    <QuestionPage
      {...props}
      route="/property-type"
      field="propertyType"
      control="radio"
      question="What type of property do you live in?"
      options={PROPERTY_TYPE_OPTIONS}
      errorMessage="Select the type of property you live in"
    />
  );
}

export default PropertyTypePage;
