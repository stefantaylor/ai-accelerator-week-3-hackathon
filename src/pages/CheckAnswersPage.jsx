import { Link } from 'react-router-dom';
import GovukButton from '../components/GovukButton';
import usePageTitle from '../components/usePageTitle';
import { labelFor } from '../content/labels';
import { requiredFields } from '../state/answers';
import { routeForField } from '../flow/journey';

const KEYS = {
  priorGrants: 'Previous Green Home Grants',
  propertyType: 'Property type',
  ownership: 'Own or rent',
  consent: 'Permission for the work',
  incomeBand: 'Annual household income',
  uninsulatedParts: 'Parts not insulated',
  heating: 'Main heating system',
};

function CheckAnswersPage({ answers, onFinish }) {
  usePageTitle('Check your answers');

  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds">
        <h1 className="govuk-heading-l">Check your answers</h1>
        <dl className="govuk-summary-list">
          {requiredFields(answers).map((field) => {
            const value = answers[field];
            const labels = Array.isArray(value) ? value.map((v) => labelFor(field, v)) : [labelFor(field, value)];
            return (
              <div className="govuk-summary-list__row" key={field}>
                <dt className="govuk-summary-list__key">{KEYS[field]}</dt>
                <dd className="govuk-summary-list__value">
                  {labels.map((label, i) => (
                    <span key={label}>
                      {i > 0 && <br />}
                      {label}
                    </span>
                  ))}
                </dd>
                <dd className="govuk-summary-list__actions">
                  <Link className="govuk-link" to={`${routeForField(field)}?change=true`}>
                    Change<span className="govuk-visually-hidden"> {KEYS[field].toLowerCase()}</span>
                  </Link>
                </dd>
              </div>
            );
          })}
        </dl>
        <GovukButton onClick={() => onFinish(answers)}>Accept and continue</GovukButton>
      </div>
    </div>
  );
}

export default CheckAnswersPage;
