import { useEffect, useRef } from 'react';

// GOV.UK Frontend error summary (v6.5.1), from components/error-summary/template-default.html.
// Focus is moved here in React, because the GOV.UK Frontend JavaScript isn't run.
export default function ErrorSummary({ errors }) {
  const ref = useRef(null);
  const hasErrors = errors.length > 0;

  useEffect(() => {
    if (hasErrors) ref.current?.focus();
  }, [hasErrors, errors]);

  if (!hasErrors) return null;

  const focusField = (event, fieldId) => {
    const field = document.getElementById(fieldId);
    if (!field) return;
    event.preventDefault();
    field.focus();
    const legend = field.closest('fieldset')?.querySelector('legend');
    (legend || field).scrollIntoView?.();
  };

  return (
    <div className="govuk-error-summary" ref={ref} tabIndex={-1}>
      <div role="alert">
        <h2 className="govuk-error-summary__title">There is a problem</h2>
        <div className="govuk-error-summary__body">
          <ul className="govuk-list govuk-error-summary__list">
            {errors.map(({ fieldId, message }) => (
              <li key={fieldId}>
                <a href={`#${fieldId}`} onClick={(event) => focusField(event, fieldId)}>
                  {message}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
