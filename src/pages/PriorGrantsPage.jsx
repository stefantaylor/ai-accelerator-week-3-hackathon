import QuestionPage from './QuestionPage';
import { PRIOR_GRANT_OPTIONS } from '../content/labels';

export default function PriorGrantsPage(props) {
  return (
    <QuestionPage
      {...props}
      route="/prior-grants"
      field="priorGrants"
      control="checkbox"
      question="Have you received a Green Home Grant before?"
      hint="Select all that apply"
      options={PRIOR_GRANT_OPTIONS}
      exclusive={['none']}
      dividerBefore="none"
      errorMessage="Select if you have received a Green Home Grant before"
    />
  );
}
