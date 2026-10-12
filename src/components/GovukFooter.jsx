export default function GovukFooter() {
  return (
    <footer className="govuk-footer">
      <div className="govuk-width-container">
        <div className="govuk-footer__sections">
          <div className="govuk-footer__section">
            <h2 className="govuk-footer__heading">Support</h2>
            <ul className="govuk-footer__list">
              <li className="govuk-footer__list-item">
                <a className="govuk-footer__link" href="/accessibility-statement">Accessibility statement</a>
              </li>
              <li className="govuk-footer__list-item">
                <a className="govuk-footer__link" href="https://www.gov.uk/help/cookies">Cookies</a>
              </li>
              <li className="govuk-footer__list-item">
                <a className="govuk-footer__link" href="https://www.gov.uk/help/privacy-notice">Privacy</a>
              </li>
              <li className="govuk-footer__list-item">
                <a className="govuk-footer__link" href="https://www.gov.uk/help/terms-conditions">Terms and conditions</a>
              </li>
            </ul>
          </div>

          <div className="govuk-footer__section">
            <h2 className="govuk-footer__heading">Information</h2>
            <ul className="govuk-footer__list">
              <li className="govuk-footer__list-item">
                <a className="govuk-footer__link" href="https://www.gov.uk/help">Help using GOV.UK</a>
              </li>
              <li className="govuk-footer__list-item">
                <a className="govuk-footer__link" href="https://www.gov.uk/government/organisations">Government organisations</a>
              </li>
              <li className="govuk-footer__list-item">
                <a className="govuk-footer__link" href="https://www.gov.uk/about">About GOV.UK</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="govuk-footer__meta">
          <div className="govuk-footer__meta-item">
            <p className="govuk-footer__copyright">&copy; Crown copyright</p>
          </div>
          <div className="govuk-footer__meta-item">
            <svg
              aria-hidden="true"
              focusable="false"
              className="govuk-footer__licence-logo"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 483.2 195.7"
              height="17"
              width="41"
            >
              <path
                fill="currentColor"
                d="M421.8 175.3c7.8-2.3 11.8-10 9.7-17.9l-.9-2.9c2.1-4.2 3.7-8.7 4.8-13.5h2.5c1.3 0 2.3-1 2.3-2.3v-.7c0-1.3-1-2.3-2.3-2.3h-3c.5-4.2.5-8.7 0-13.1h3c1.3 0 2.3-1 2.3-2.3v-.7c0-1.3-1-2.3-2.3-2.3h-2.5c-1.1-4.8-2.6-9.3-4.8-13.5l.9-2.9c1.5-4.7-1.5-9.6-6.2-11.1-4.7-1.5-9.6 1.5-11.1 6.2l-.9 2.9c-3.4-1.7-7.1-3-11.1-3.8v-3.3c0-1.3-1-2.3-2.3-2.3h-.7c-1.3 0-2.3 1-2.3 2.3v3.3c-4 .8-7.7 2.1-11.1 3.8l-.9-2.9c-1.5-4.7-6.4-7.7-11.1-6.2-4.7 1.5-7.7 6.4-6.2 11.1l.9 2.9c-2.1 4.2-3.7 8.7-4.8 13.5h-3c-1.3 0-2.3 1-2.3 2.3v.7c0 1.3 1 2.3 2.3 2.3h2.5c-.5 4.2-.5 8.7 0 13.1h-3c-1.3 0-2.3 1-2.3 2.3v.7c0 1.3 1 2.3 2.3 2.3h3c1.1 4.8 2.6 9.3 4.8 13.5l-.9 2.9c-1.5 4.7 1.5 9.6 6.2 11.1.8.3 1.6.4 2.4.4 3.9 0 7.5-2.5 8.7-6.6l.9-2.9c3.4 1.7 7.1 3 11.1 3.8v3.3c0 1.3 1 2.3 2.3 2.3h.7c1.3 0 2.3-1 2.3-2.3v-3.3c4-.8 7.7-2.1 11.1-3.8l.9 2.9c1.2 4.1 4.8 6.6 8.7 6.6.8 0 1.6-.1 2.4-.4z"
              />
            </svg>
            <span className="govuk-footer__licence-description">
              All content is available under the&nbsp;
              <a
                className="govuk-footer__link"
                href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
                rel="license"
              >
                Open Government Licence v3.0
              </a>
              , except where otherwise stated
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
