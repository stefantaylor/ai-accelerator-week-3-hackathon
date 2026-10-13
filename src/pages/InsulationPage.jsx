import QuestionPage from './QuestionPage';
import { UNINSULATED_PART_OPTIONS } from '../content/labels';

function InsulationPage(props) {
  return (
    <QuestionPage
      {...props}
      route="/insulation"
      field="uninsulatedParts"
      control="checkbox"
      question="Which parts of your property are not insulated?"
      hint="Select all that apply"
      options={UNINSULATED_PART_OPTIONS}
      exclusive={['allInsulated', 'notSure']}
      dividerBefore="allInsulated"
      errorMessage="Select which parts of your property are not insulated, or select 'All parts are insulated' or 'I'm not sure'"
    />
  );
}

export default InsulationPage;
