// GOV.UK Frontend phase banner (v6.5.1), from components/phase-banner/template-default.html.
export default function PhaseBanner({ phase = 'alpha', feedbackHref = '#' }) {
  return (
    <div className="govuk-phase-banner govuk-width-container">
      <p className="govuk-phase-banner__content">
        <strong className="govuk-tag govuk-phase-banner__content__tag">
          {phase.charAt(0).toUpperCase() + phase.slice(1)}
        </strong>
        <span className="govuk-phase-banner__text">
          This is a new service - your <a href={feedbackHref} className="govuk-link">feedback</a> will help us to
          improve it.
        </span>
      </p>
    </div>
  );
}
