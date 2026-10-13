import { useEffect, useRef } from 'react';
import { useLanguage } from '../content/language.jsx';

// Based on the HMRC language select pattern used on GOV.UK services with a Welsh version.
// Each language is written in its own language, with a lang attribute so it is read out correctly.
const OPTIONS = [
  { code: 'en', name: 'English', switchText: 'Change the language to English' },
  { code: 'cy', name: 'Cymraeg', switchText: 'Newid yr iaith i’r Gymraeg' },
];

export default function LanguageSelect() {
  const { lang, setLang, t } = useLanguage();
  const linkRef = useRef(null);
  const switched = useRef(false);

  // The link that was clicked becomes plain text, so keep focus in the switcher
  useEffect(() => {
    if (switched.current) {
      linkRef.current?.focus();
      switched.current = false;
    }
  }, [lang]);

  const handleSwitch = (e, code) => {
    e.preventDefault();
    switched.current = true;
    setLang(code);
  };

  return (
    <nav className="app-language-select" aria-label={t('languageSelect.label')}>
      <ul className="app-language-select__list">
        {OPTIONS.map(({ code, name, switchText }) => (
          <li key={code} className="app-language-select__list-item">
            {code === lang ? (
              <span aria-current="true">{name}</span>
            ) : (
              <a
                ref={linkRef}
                href={`?lang=${code}`}
                hrefLang={code}
                lang={code}
                rel="alternate"
                className="govuk-link"
                onClick={(e) => handleSwitch(e, code)}
              >
                <span className="govuk-visually-hidden">{switchText}</span>
                <span aria-hidden="true">{name}</span>
              </a>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
