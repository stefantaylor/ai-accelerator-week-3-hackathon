import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../content/language.jsx';

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
  const { t } = useLanguage();
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
      aria-label={t('cookieBanner.label')}
    >
      {view === 'question' ? (
        <div className="govuk-cookie-banner__message govuk-width-container">
          <div className="govuk-grid-row">
            <div className="govuk-grid-column-two-thirds">
              <h2 className="govuk-cookie-banner__heading govuk-heading-m">{t('cookieBanner.heading')}</h2>
              <div className="govuk-cookie-banner__content">
                <p className="govuk-body">{t('cookieBanner.essential')}</p>
                <p className="govuk-body">{t('cookieBanner.analytics')}</p>
              </div>
              <div className="govuk-button-group">
                <button type="button" className="govuk-button" onClick={() => handleChoice('accept')}>
                  {t('cookieBanner.accept')}
                </button>
                <button type="button" className="govuk-button" onClick={() => handleChoice('reject')}>
                  {t('cookieBanner.reject')}
                </button>
                <a className="govuk-link" href="https://www.gov.uk/help/cookies">{t('cookieBanner.view')}</a>
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
                  {t(view === 'accept' ? 'cookieBanner.accepted' : 'cookieBanner.rejected')}
                </p>
              </div>
              <div className="govuk-button-group">
                <button type="button" className="govuk-button" onClick={() => setView('hidden')}>
                  {t('cookieBanner.hide')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
