// GOV.UK Frontend form group + fieldset with the legend as the page heading,
// hint and error message (v6.5.1), from components/radios fixture
// "with legend as page heading" and checkboxes "with error message".
// Shared by RadioGroup and CheckboxGroup.
export default function QuestionFieldset({ name, legend, hint, error, children }) {
  const hintId = hint ? `${name}-hint` : null;
  const errorId = error ? `${name}-error` : null;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`govuk-form-group${error ? ' govuk-form-group--error' : ''}`}>
      <fieldset className="govuk-fieldset" aria-describedby={describedBy}>
        <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
          <h1 className="govuk-fieldset__heading">{legend}</h1>
        </legend>
        {hint && (
          <div id={hintId} className="govuk-hint">
            {hint}
          </div>
        )}
        {error && (
          <p id={errorId} className="govuk-error-message">
            <span className="govuk-visually-hidden">Error:</span> {error}
          </p>
        )}
        {children}
      </fieldset>
    </div>
  );
}

// GOV.UK Frontend ids: the first input is `name`, then `name-2`, `name-3`...
export const inputId = (name, index) => (index === 0 ? name : `${name}-${index + 1}`);
