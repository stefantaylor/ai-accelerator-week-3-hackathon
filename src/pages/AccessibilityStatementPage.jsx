import { contactEmail, contactPhone } from '../content/labels.js';
import { usePageTitle } from '../hooks/usePageTitle.js';

export default function AccessibilityStatementPage() {
  usePageTitle('Accessibility statement');

  return (
    <>
      <h1 className="govuk-heading-xl">Accessibility statement</h1>
      <p className="govuk-body">This accessibility statement applies to the Green Home Grant Eligibility Checker (alpha prototype).</p>

      <h2 className="govuk-heading-l">How accessible this service is</h2>
      <p className="govuk-body">This service is partially compliant with WCAG 2.2 Level AA.</p>
      <p className="govuk-body">The following issues are known non-compliances:</p>
      <ul className="govuk-list govuk-list--bullet">
        <li>JavaScript is required to use this service. This service will not work if JavaScript is disabled.</li>
      </ul>

      <h2 className="govuk-heading-l">Feedback and contact information</h2>
      <p className="govuk-body">If you have difficulty using this service or need adjustments, please contact us:</p>
      <ul className="govuk-list">
        <li>Email: <a href={`mailto:${contactEmail}`} className="govuk-link">{contactEmail}</a></li>
        <li>Phone: {contactPhone}</li>
      </ul>

      <h2 className="govuk-heading-l">Reporting accessibility problems with this service</h2>
      <p className="govuk-body">
        We are always looking to improve the accessibility of this service. If you find any problems not listed on
        this page or think we are not meeting accessibility requirements, contact us using the details above.
      </p>

      <h2 className="govuk-heading-l">Enforcement procedure</h2>
      <p className="govuk-body">
        The Equality and Human Rights Commission (EHRC) is responsible for enforcing the Public Sector Bodies
        (Websites and Mobile Applications) (No. 2) Accessibility Regulations 2018 (the ‘accessibility regulations’).
        If you are not happy with how we respond to your complaint,{' '}
        <a href="https://www.equalityadvisoryservice.com/" className="govuk-link">
          contact the Equality Advisory and Support Service (EASS)
        </a>.
      </p>

      <h2 className="govuk-heading-l">Technical information about this service’s accessibility</h2>
      <p className="govuk-body">This service uses the following technologies:</p>
      <ul className="govuk-list govuk-list--bullet">
        <li>React for user interface</li>
        <li>Browser sessionStorage for client-side data persistence</li>
        <li>GOV.UK Design System components and styles</li>
      </ul>

      <h2 className="govuk-heading-l">How we tested this service</h2>
      <p className="govuk-body">This is an alpha prototype. Accessibility testing is ongoing.</p>
      <p className="govuk-body">Testing includes:</p>
      <ul className="govuk-list govuk-list--bullet">
        <li>Automated accessibility scanning with axe and Lighthouse</li>
        <li>Keyboard navigation testing</li>
        <li>Screen reader compatibility testing</li>
      </ul>

      <h2 className="govuk-heading-l">What we are doing to improve accessibility</h2>
      <p className="govuk-body">As this is an alpha prototype, we are actively working to improve accessibility and fix any identified issues.</p>

      <h2 className="govuk-heading-l">Preparation of this accessibility statement</h2>
      <p className="govuk-body">
        This statement was prepared on 13 October 2026. The service was last tested on 13 October 2026 by the
        service team, using automated checks and manual keyboard testing.
      </p>
    </>
  );
}
