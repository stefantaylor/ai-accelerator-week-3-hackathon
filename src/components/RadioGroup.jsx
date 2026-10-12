export default function RadioGroup({
  name,
  legend,
  hint,
  options,
  value,
  onChange,
  error,
  dividerBefore,
}) {
  return (
    <fieldset className={`govuk-fieldset ${error ? 'govuk-form-group--error' : ''}`}>
      <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
        <h1 className="govuk-fieldset__heading">{legend}</h1>
      </legend>
      {hint && <div className="govuk-hint">{hint}</div>}
      {error && <p className="govuk-error-message"><span className="govuk-visually-hidden">Error:</span> {error}</p>}
      <div className="govuk-radios" data-module="govuk-radios">
        {options.map((option, idx) => (
          <div key={option.value}>
            {dividerBefore && dividerBefore.includes(idx) && (
              <div className="govuk-radios__divider">or</div>
            )}
            <div className="govuk-radios__item">
              <input
                className="govuk-radios__input"
                id={idx === 0 ? name : `${name}-${idx}`}
                name={name}
                type="radio"
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange(e.target.value)}
              />
              <label className="govuk-label govuk-radios__label" htmlFor={idx === 0 ? name : `${name}-${idx}`}>
                {option.label}
              </label>
            </div>
          </div>
        ))}
      </div>
    </fieldset>
  );
}
