function GovukHeader() {
  return (
    <header className="govuk-header" role="banner">
      <div className="govuk-header__container">
        <div className="govuk-header__logo">
          <a href="https://www.gov.uk" className="govuk-header__link govuk-header__link--homepage">
            <span className="govuk-header__logotype">
              <span className="govuk-header__logotype-text">GOV.UK</span>
            </span>
          </a>
        </div>
        <div className="govuk-header__content">
          <a href="/" className="govuk-header__link govuk-header__service-name">
            Check if you can get a Green Home Grant
          </a>
        </div>
      </div>
    </header>
  );
}

export default GovukHeader;
