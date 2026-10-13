import { useNavigate } from 'react-router-dom';
import { assessEligibility } from '../eligibility/assessEligibility.js';
import { getLabel, getReasonText } from '../content/labels.js';
import { backRouteWithEarlyExit } from '../flow/journey.js';
import GovukButton from '../components/GovukButton';

function ResultPage({ answers, onAnswer, onReset }) {
  const navigate = useNavigate();
  document.title = 'Result - Check if you can get a Green Home Grant - GOV.UK';

  const result = assessEligibility(answers);

  const handleBack = () => {
    navigate(backRouteWithEarlyExit('/result', answers));
  };

  return (
    <>
      <a href="#" className="govuk-back-link" onClick={(e) => { e.preventDefault(); handleBack(); }}>
        Back
      </a>

      {result.overallEligible ? (
        <div className="govuk-panel">
          <h1 className="govuk-panel__title">You may be eligible for a Green Home Grant</h1>
          <p className="govuk-panel__body">We could cover {result.supportPercentage}% of the cost</p>
        </div>
      ) : (
        <div className="govuk-panel govuk-panel--not-eligible">
          <h1 className="govuk-panel__title">You are not eligible for a Green Home Grant</h1>
        </div>
      )}

      <h2 className="govuk-heading-m">Insulation grant</h2>
      {result.insulation.eligible ? (
        <>
          <p className="govuk-body">You may be eligible.</p>
          {result.insulation.needsAssessment ? (
            <p className="govuk-body">An assessor will check which parts of your property need insulating.</p>
          ) : (
            <>
              <p className="govuk-body">We could cover insulation for:</p>
              <ul className="govuk-list govuk-list--bullet">
                {result.insulation.coveredParts?.map(part => (
                  <li key={part}>{getLabel('uninsulatedParts', part)}</li>
                ))}
              </ul>
            </>
          )}
        </>
      ) : (
        <p className="govuk-body">{getReasonText(result.insulation.reason, answers.ownership)}</p>
      )}

      <h2 className="govuk-heading-m">Heat pump grant</h2>
      {result.heatPump.eligible ? (
        <p className="govuk-body">You may be eligible for a heat pump grant.</p>
      ) : (
        <p className="govuk-body">{getReasonText(result.heatPump.reason, answers.ownership)}</p>
      )}

      <h2 className="govuk-heading-m">What happens next</h2>
      <p className="govuk-body">This is a check to see if you might be eligible. It is not an application.</p>
      <p className="govuk-body">
        If you are eligible, you can apply for a Green Home Grant using the official application process.
      </p>

      <GovukButton onClick={() => { onReset(); navigate('/prior-grants'); }}>Start again</GovukButton>
    </>
  );
}

export default ResultPage;
