import { useEffect, useRef, useState } from 'react';

// The service does not set analytics cookies yet. The choice is stored so the
// banner is not shown again, and so analytics can honour it if added later.
const STORAGE_KEY = 'ghg-checker:cookie-consent';

function loadChoice() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function saveChoice(choice) {
  try {
    window.localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // Storage unavailable - banner will show again next visit
  }
}

export default function CookieBanner() {
  // 'question' | 'accept' | 'reject' | 'hidden'
  const [view, setView] = useState(() => (loadChoice() ? 'hidden' : 'question'));
  const confirmationRef = useRef(null);

  useEffect(() => {
    if (view === 'accept' || view === 'reject') {
      confirmationRef.current?.focus();
    }
  }, [view]);

  const handleChoice = (choice) => {
    saveChoice(choice);
    setView(choice);
  };

  if (view === 'hidden') return null;

  return (
    <div
      className="govuk-cookie-banner"
      data-nosnippet=""
      role="region"
      aria-label="Cookies on Check if you can get a Green Home Grant"
    >
      {view === 'question' ? (
        <div className="govuk-cookie-banner__message govuk-width-container">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <h2 className="govuk-cookie-banner__heading govuk-heading-m">Cookies on our service</h2>
              <div className="govuk-cookie-banner__content">
                <p className="govuk-body">We use some essential cookies to make this service work.</p>
                <p className="govuk-body">
                  We’d also like to use analytics cookies so we can understand how you use the service and make
                  improvements.
                </p>
              </div>
              <div className="govuk-button-group">
                <button type="button" className="govuk-button" onClick={() => handleChoice('accept')}>
                  Accept analytics cookies
                </button>
                <button type="button" className="govuk-button" onClick={() => handleChoice('reject')}>
                  Reject analytics cookies
                </button>
                <a className="govuk-link" href="https://www.gov.uk/help/cookies">View cookies</a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className="govuk-cookie-banner__message govuk-width-container"
          role="alert"
          tabIndex={-1}
          ref={confirmationRef}
        >
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <div className="govuk-cookie-banner__content">
                <p className="govuk-body">
                  You’ve {view === 'accept' ? 'accepted' : 'rejected'} additional cookies.
                </p>
              </div>
              <div className="govuk-button-group">
                <button type="button" className="govuk-button" onClick={() => setView('hidden')}>
                  Hide cookie message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
