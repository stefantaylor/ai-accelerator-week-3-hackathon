import QuestionPage from './QuestionPage';
import { CONSENT_OPTIONS } from '../content/labels';

export const CONSENT_WORDING = {
  sharedOwnership: {
    question: 'Do all owners of the property agree to the work?',
    errorMessage: 'Select yes if all owners agree to the work',
  },
  rent: {
    question: "Do you have your landlord's permission for the work?",
    errorMessage: "Select yes if you have your landlord's permission",
  },
};

export default function ConsentPage(props) {
  const wording = CONSENT_WORDING[props.answers.ownership] ?? CONSENT_WORDING.rent;
  return (
    <QuestionPage
      {...props}
      route="/consent"
      field="consent"
      control="radio"
      question={wording.question}
      options={CONSENT_OPTIONS}
      errorMessage={wording.errorMessage}
    />
  );
}
