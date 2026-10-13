import { useNavigate } from 'react-router-dom';
import { assessEligibility } from '../eligibility/assessEligibility.js';
import { getLabel, getReasonText } from '../content/labels.js';
import { backRouteWithEarlyExit } from '../flow/journey.js';
import GovukButton from '../components/GovukButton';
import { useLanguage } from '../content/language.jsx';

function ResultPage({ answers, onAnswer, onReset }) {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  document.title = `${t('result.title')} - ${t('titleSuffix')}`;

  const result = assessEligibility(answers);

  const handleBack = () => {
    navigate(backRouteWithEarlyExit('/result', answers));
  };

  return (
    <>
      <a href="#" className="govuk-back-link" onClick={(e) => { e.preventDefault(); handleBack(); }}>
        {t('back')}
      </a>

      {result.overallEligible ? (
        <div className="govuk-panel">
          <h1 className="govuk-panel__title">{t('result.eligible')}</h1>
          <p className="govuk-panel__body">{t('result.supportPercentage', { percentage: result.supportPercentage })}</p>
        </div>
      ) : (
        <div className="govuk-panel govuk-panel--not-eligible">
          <h1 className="govuk-panel__title">{t('result.notEligible')}</h1>
        </div>
      )}

      <h2 className="govuk-heading-m">{t('result.insulationHeading')}</h2>
      {result.insulation.eligible ? (
        <>
          <p className="govuk-body">{t('result.insulationEligible')}</p>
          {result.insulation.needsAssessment ? (
            <p className="govuk-body">{t('result.needsAssessment')}</p>
          ) : (
            <>
              <p className="govuk-body">{t('result.coveredParts')}</p>
              <ul className="govuk-list govuk-list--bullet">
                {result.insulation.coveredParts?.map(part => (
                  <li key={part}>{getLabel('uninsulatedParts', part, lang)}</li>
                ))}
              </ul>
            </>
          )}
        </>
      ) : (
        <p className="govuk-body">{getReasonText(result.insulation.reason, answers.ownership, lang)}</p>
      )}

      <h2 className="govuk-heading-m">{t('result.heatPumpHeading')}</h2>
      {result.heatPump.eligible ? (
        <p className="govuk-body">{t('result.heatPumpEligible')}</p>
      ) : (
        <p className="govuk-body">{getReasonText(result.heatPump.reason, answers.ownership, lang)}</p>
      )}

      <h2 className="govuk-heading-m">{t('result.nextHeading')}</h2>
      <p className="govuk-body">{t('result.nextNotApplication')}</p>
      <p className="govuk-body">{t('result.nextApply')}</p>

      <GovukButton onClick={() => { onReset(); navigate('/prior-grants'); }}>{t('result.startAgain')}</GovukButton>
    </>
  );
}

export default ResultPage;
