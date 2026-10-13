import usePageTitle from '../components/usePageTitle';

export default function AccessibilityStatementPage() {
  usePageTitle('Accessibility statement');

  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds">
        <h1 className="govuk-heading-xl">Accessibility statement</h1>
        <p className="govuk-body">
          This accessibility statement applies to the Check if you can get a Green Home Grant service. This is a
          prototype in alpha.
        </p>
        <p className="govuk-body">
          This service is run by [prototype: department to be confirmed]. We want as many people as possible to be
          able to use it. For example, that means you should be able to:
        </p>
        <ul className="govuk-list govuk-list--bullet">
          <li>change colours, contrast levels and fonts using browser or device settings</li>
          <li>zoom in up to 400% without the text spilling off the screen</li>
          <li>navigate the whole service using just a keyboard</li>
          <li>listen to the whole service using a screen reader</li>
        </ul>

        <h2 className="govuk-heading-l">How accessible this service is</h2>
        <p className="govuk-body">We know some parts of this service are not fully accessible:</p>
        <ul className="govuk-list govuk-list--bullet">
          <li>the service does not work if JavaScript is turned off</li>
        </ul>

        <h2 className="govuk-heading-l">Feedback and contact information</h2>
        <p className="govuk-body">
          If you need information in a different format, or have problems using this service, contact us:
        </p>
        <ul className="govuk-list govuk-list--bullet">
          <li>email: [prototype: to be confirmed]@example.gov.uk</li>
          <li>phone: [prototype: to be confirmed]</li>
        </ul>
        <p className="govuk-body">We'll consider your request and get back to you in [prototype: to be confirmed] days.</p>

        <h3 className="govuk-heading-m">Enforcement procedure</h3>
        <p className="govuk-body">
          The Equality and Human Rights Commission (EHRC) is responsible for enforcing the Public Sector Bodies
          (Websites and Mobile Applications) (No. 2) Accessibility Regulations 2018 (the 'accessibility
          regulations'). If you're not happy with how we respond to your complaint, contact the{' '}
          <a className="govuk-link" href="https://www.equalityadvisoryservice.com/">
            Equality Advisory and Support Service (EASS)
          </a>
          .
        </p>

        <h2 className="govuk-heading-l">Technical information</h2>
        <p className="govuk-body">This service is partially compliant with WCAG 2.2 AA.</p>
        <h3 className="govuk-heading-m">Non-accessible content</h3>
        <p className="govuk-body">The content listed below is non-accessible for the following reasons.</p>
        <ul className="govuk-list govuk-list--bullet">
          <li>
            The service needs JavaScript to work. If JavaScript is turned off or fails to load, you cannot use the
            service.
          </li>
        </ul>
        <p className="govuk-body">
          To protect your information, we delete your answers if you do not do anything for 10 minutes. We warn you 2
          minutes before this happens, and you can choose to keep your answers. This meets WCAG 2.2 success criterion
          2.2.1 (Timing adjustable).
        </p>

        <h2 className="govuk-heading-l">How we tested this service</h2>
        <p className="govuk-body">This service was tested in [prototype: date to be confirmed] by the service team. We:</p>
        <ul className="govuk-list govuk-list--bullet">
          <li>used automated tests to check page structure, labels and error messages</li>
          <li>completed the whole service using only a keyboard</li>
          <li>ran an automated accessibility scan of every page</li>
        </ul>

        <h2 className="govuk-heading-l">What we are doing to improve</h2>
        <p className="govuk-body">
          Before this service goes live, we plan to make it work without JavaScript and to have it audited by an
          accessibility specialist.
        </p>
        <p className="govuk-body">This statement was prepared on 12 October 2026.</p>
      </div>
    </div>
  );
}
