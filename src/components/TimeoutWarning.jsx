import GovukButton from './GovukButton';

// GOV.UK Frontend notification banner (v6.5.1), from
// components/notification-banner/template-default.html, with role="alert"
// so screen readers announce it when it appears (spec §4.8). Focus isn't moved.
export default function TimeoutWarning({ onKeep }) {
  return (
    <div className="govuk-notification-banner" role="alert" aria-labelledby="timeout-warning-title">
      <div className="govuk-notification-banner__header">
        <h2 className="govuk-notification-banner__title" id="timeout-warning-title">
          Important
        </h2>
      </div>
      <div className="govuk-notification-banner__content">
        <p className="govuk-notification-banner__heading">We will delete your answers in 2 minutes</p>
        <p className="govuk-body">
          You have not done anything for 8 minutes. We delete answers after 10 minutes to protect your information.
        </p>
        <GovukButton onClick={onKeep}>Keep my answers</GovukButton>
      </div>
    </div>
  );
}
