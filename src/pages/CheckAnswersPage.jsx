import { Link, useNavigate } from 'react-router-dom';
import { getLabel } from '../content/labels.js';
import { backRoute } from '../flow/journey.js';
import GovukButton from '../components/GovukButton';
import { usePageTitle } from '../hooks/usePageTitle.js';

function SummaryRow({ label, value, changeRoute, hiddenText }) {
  return (
    <div className="govuk-summary-list__row">
      <dt className="govuk-summary-list__key">{label}</dt>
      <dd className="govuk-summary-list__value">{value}</dd>
      <dd className="govuk-summary-list__actions">
        <Link className="govuk-link" to={`${changeRoute}?change=true`}>
          Change<span className="govuk-visually-hidden"> {hiddenText}</span>
        </Link>
      </dd>
    </div>
  );
}

function CheckAnswersPage({ answers }) {
  const navigate = useNavigate();
  usePageTitle('Check your answers');

  const consentRequired = answers.ownership === 'sharedOwnership' || answers.ownership === 'rent';

  const priorGrantsValue = answers.priorGrants.includes('none')
    ? getLabel('priorGrants', 'none')
    : answers.priorGrants.map(grant => getLabel('priorGrants', grant)).join(', ');

  return (
    <>
      <Link to={backRoute('/check-answers', answers)} className="govuk-back-link">Back</Link>

      <h1 className="govuk-heading-l">Check your answers</h1>

      <dl className="govuk-summary-list">
        <SummaryRow
          label="Green Home Grants received"
          value={priorGrantsValue}
          changeRoute="/prior-grants"
          hiddenText="grants received"
        />
        <SummaryRow
          label="Property type"
          value={getLabel('propertyType', answers.propertyType)}
          changeRoute="/property-type"
          hiddenText="property type"
        />
        <SummaryRow
          label="Ownership"
          value={getLabel('ownership', answers.ownership)}
          changeRoute="/ownership"
          hiddenText="ownership"
        />
        {consentRequired && (
          <SummaryRow
            label={answers.ownership === 'sharedOwnership' ? 'All owners agree' : 'Landlord consent'}
            value={getLabel('consent', answers.consent)}
            changeRoute="/consent"
            hiddenText="consent"
          />
        )}
        <SummaryRow
          label="Household income"
          value={getLabel('incomeBand', answers.incomeBand)}
          changeRoute="/income"
          hiddenText="income"
        />
        <SummaryRow
          label="Uninsulated parts"
          value={answers.uninsulatedParts.map(part => getLabel('uninsulatedParts', part)).join(', ')}
          changeRoute="/insulation"
          hiddenText="uninsulated parts"
        />
        <SummaryRow
          label="Heating system"
          value={getLabel('heating', answers.heating)}
          changeRoute="/heating"
          hiddenText="heating system"
        />
      </dl>

      <GovukButton onClick={() => navigate('/result')}>Accept and continue</GovukButton>
    </>
  );
}

export default CheckAnswersPage;
