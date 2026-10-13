import usePageTitle from '../components/usePageTitle';
import { labelFor } from '../content/labels';

const ELIGIBLE_TITLE = 'You may be eligible for a Green Home Grant';
const NOT_ELIGIBLE_TITLE = 'You are not eligible for a Green Home Grant';

// Reason sentences (spec §4.6).
function reasonSentence(reason, ownership) {
  switch (reason) {
    case 'ALREADY_RECEIVED':
      return 'You have already received this grant. You can only get one grant of each type.';
    case 'NO_CONSENT':
      return ownership === 'sharedOwnership'
        ? 'All owners of the property must agree to the work before you can apply.'
        : "You need your landlord's permission before you can apply.";
    case 'ALREADY_INSULATED':
      return 'You told us all parts of your property are insulated.';
    case 'ALREADY_HAS_HEAT_PUMP':
      return 'Your property already has a heat pump.';
    default:
      return null;
  }
}

function InsulationOutcome({ outcome, ownership }) {
  if (!outcome.eligible) return <p className="govuk-body">{reasonSentence(outcome.reason, ownership)}</p>;
  if (outcome.needsAssessment) {
    return (
      <p className="govuk-body">
        You may be eligible. An assessor will check which parts of your property need insulating.
      </p>
    );
  }
  return (
    <>
      <p className="govuk-body">You may be eligible for insulation for your:</p>
      <ul className="govuk-list govuk-list--bullet">
        {outcome.coveredParts.map((part) => (
          <li key={part}>{labelFor('uninsulatedParts', part).toLowerCase()}</li>
        ))}
      </ul>
    </>
  );
}

function ResultPage({ outcome }) {
  const { answers, result } = outcome;
  usePageTitle(result.overallEligible ? ELIGIBLE_TITLE : NOT_ELIGIBLE_TITLE);

  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds">
        {result.overallEligible ? (
          <div className="govuk-panel govuk-panel--confirmation">
            <h1 className="govuk-panel__title">{ELIGIBLE_TITLE}</h1>
            <div className="govuk-panel__body">We could cover {result.supportPercentage}% of the cost</div>
          </div>
        ) : (
          <h1 className="govuk-heading-l">{NOT_ELIGIBLE_TITLE}</h1>
        )}

        <h2 className="govuk-heading-m">Insulation grant</h2>
        <InsulationOutcome outcome={result.insulation} ownership={answers.ownership} />

        <h2 className="govuk-heading-m">Heat pump grant</h2>
        <p className="govuk-body">
          {result.heatPump.eligible
            ? 'You may be eligible for a heat pump.'
            : reasonSentence(result.heatPump.reason, answers.ownership)}
        </p>

        <h2 className="govuk-heading-m">What happens next</h2>
        <p className="govuk-body">This is a check, not an application. It does not mean you will get a grant.</p>
        <p className="govuk-body">We have deleted the answers you gave.</p>
        <p className="govuk-body">[Prototype: details of how to apply are to be confirmed.]</p>
      </div>
    </div>
  );
}

export default ResultPage;
