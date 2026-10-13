import { useEffect, useRef } from 'react';
import { useLanguage } from '../content/language.jsx';

export default function ErrorSummary({ errors }) {
  const { t } = useLanguage();
  const ref = useRef(null);

  useEffect(() => {
    if (errors && errors.length > 0 && ref.current) {
      ref.current.focus();
    }
  }, [errors]);

  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <div
      ref={ref}
      className="govuk-error-summary"
      data-module="govuk-error-summary"
      role="alert"
      tabIndex="-1"
    >
      <h2 className="govuk-error-summary__title">{t('errorSummaryTitle')}</h2>
      <div className="govuk-error-summary__body">
        <ul className="govuk-list govuk-error-summary__list">
          {errors.map((error, idx) => (
            <li key={idx}>
              <a href={`#${error.fieldId}`}>{t(error.messageKey)}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
