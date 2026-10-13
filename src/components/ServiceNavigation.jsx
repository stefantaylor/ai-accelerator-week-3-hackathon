import { Link } from 'react-router-dom';

export const SERVICE_NAME = 'Check if you can get a Green Home Grant';

// GOV.UK Frontend service navigation (v6.5.1), fixture "with service link".
// Service name only, no navigation links, so no JavaScript is needed.
export default function ServiceNavigation() {
  return (
    <section aria-label="Service information" className="govuk-service-navigation">
      <div className="govuk-width-container">
        <div className="govuk-service-navigation__container">
          <span className="govuk-service-navigation__service-name">
            <Link to="/" className="govuk-service-navigation__link">
              {SERVICE_NAME}
            </Link>
          </span>
        </div>
      </div>
    </section>
  );
}
