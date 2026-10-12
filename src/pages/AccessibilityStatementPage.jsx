export default function AccessibilityStatementPage() {
  document.title = 'Accessibility statement - Check if you can get a Green Home Grant - GOV.UK';

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
        <li>Email: <a href="mailto:support@example.gov.uk" className="govuk-link">support@example.gov.uk</a></li>
        <li>Phone: 0123 456 7890</li>
      </ul>

      <h2 className="govuk-heading-l">Technical information</h2>
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

      <h2 className="govuk-heading-l">What we are doing to improve</h2>
      <p className="govuk-body">As this is an alpha prototype, we are actively working to improve accessibility and fix any identified issues.</p>
    </>
  );
}
