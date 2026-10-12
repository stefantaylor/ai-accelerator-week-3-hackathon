import { useNavigate } from 'react-router-dom';
import { getLabel } from '../content/labels.js';
import { backRoute } from '../flow/journey.js';
import GovukButton from '../components/GovukButton';

function CheckAnswersPage({ answers, onAnswer }) {
  const navigate = useNavigate();
  document.title = 'Check your answers - Check if you can get a Green Home Grant - GOV.UK';

  const handleBack = () => {
    navigate(backRoute('/check-answers', answers));
  };

  const handleChange = (route) => {
    navigate(`${route}?change=true`);
  };

  const handleContinue = () => {
    navigate('/result');
  };

  return (
    <>
      <a href="#" className="govuk-back-link" onClick={(e) => { e.preventDefault(); handleBack(); }}>
        Back
      </a>

      <h1 className="govuk-heading-l">Check your answers</h1>

      <dl className="govuk-summary-list">
        {/* Prior Grants */}
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Green Home Grants received</dt>
          <dd className="govuk-summary-list__value">
            {answers.priorGrants.length === 0 ? (
              <span>No grants received</span>
            ) : answers.priorGrants.includes('none') ? (
              <span>{getLabel('priorGrants', 'none')}</span>
            ) : (
              <ul className="govuk-list">
                {answers.priorGrants.map(grant => (
                  <li key={grant}>{getLabel('priorGrants', grant)}</li>
                ))}
              </ul>
            )}
          </dd>
          <dd className="govuk-summary-list__actions">
            <a className="govuk-link" href="#" onClick={(e) => { e.preventDefault(); handleChange('/prior-grants'); }}>
              Change<span className="govuk-visually-hidden"> grants received</span>
            </a>
          </dd>
        </div>

        {/* Property Type */}
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Property type</dt>
          <dd className="govuk-summary-list__value">{getLabel('propertyType', answers.propertyType)}</dd>
          <dd className="govuk-summary-list__actions">
            <a className="govuk-link" href="#" onClick={(e) => { e.preventDefault(); handleChange('/property-type'); }}>
              Change<span className="govuk-visually-hidden"> property type</span>
            </a>
          </dd>
        </div>

        {/* Ownership */}
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Ownership</dt>
          <dd className="govuk-summary-list__value">{getLabel('ownership', answers.ownership)}</dd>
          <dd className="govuk-summary-list__actions">
            <a className="govuk-link" href="#" onClick={(e) => { e.preventDefault(); handleChange('/ownership'); }}>
              Change<span className="govuk-visually-hidden"> ownership</span>
            </a>
          </dd>
        </div>

        {/* Consent (conditional) */}
        {(answers.ownership === 'sharedOwnership' || answers.ownership === 'rent') && (
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">
              {answers.ownership === 'sharedOwnership' ? 'All owners agree' : 'Landlord consent'}
            </dt>
            <dd className="govuk-summary-list__value">{getLabel('consent', answers.consent)}</dd>
            <dd className="govuk-summary-list__actions">
              <a className="govuk-link" href="#" onClick={(e) => { e.preventDefault(); handleChange('/consent'); }}>
                Change<span className="govuk-visually-hidden"> consent</span>
              </a>
            </dd>
          </div>
        )}

        {/* Income */}
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Household income</dt>
          <dd className="govuk-summary-list__value">{getLabel('incomeBand', answers.incomeBand)}</dd>
          <dd className="govuk-summary-list__actions">
            <a className="govuk-link" href="#" onClick={(e) => { e.preventDefault(); handleChange('/income'); }}>
              Change<span className="govuk-visually-hidden"> income</span>
            </a>
          </dd>
        </div>

        {/* Uninsulated parts */}
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Uninsulated parts</dt>
          <dd className="govuk-summary-list__value">
            {answers.uninsulatedParts.length === 0 ? (
              <span>Not answered</span>
            ) : (
              <ul className="govuk-list">
                {answers.uninsulatedParts.map(part => (
                  <li key={part}>{getLabel('uninsulatedParts', part)}</li>
                ))}
              </ul>
            )}
          </dd>
          <dd className="govuk-summary-list__actions">
            <a className="govuk-link" href="#" onClick={(e) => { e.preventDefault(); handleChange('/insulation'); }}>
              Change<span className="govuk-visually-hidden"> uninsulated parts</span>
            </a>
          </dd>
        </div>

        {/* Heating */}
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Heating system</dt>
          <dd className="govuk-summary-list__value">{getLabel('heating', answers.heating)}</dd>
          <dd className="govuk-summary-list__actions">
            <a className="govuk-link" href="#" onClick={(e) => { e.preventDefault(); handleChange('/heating'); }}>
              Change<span className="govuk-visually-hidden"> heating system</span>
            </a>
          </dd>
        </div>
      </dl>

      <GovukButton onClick={handleContinue}>Accept and continue</GovukButton>
    </>
  );
}

export default CheckAnswersPage;
