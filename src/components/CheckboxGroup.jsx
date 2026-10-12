export default function CheckboxGroup({
  name,
  legend,
  hint,
  options,
  value,
  onChange,
  error,
  exclusive,
  dividerBefore,
  dividerLabel = 'or',
}) {
  const handleChange = (optionValue) => {
    let newValue;

    if (value.includes(optionValue)) {
      // Uncheck
      newValue = value.filter(v => v !== optionValue);
    } else {
      // Check
      if (exclusive && exclusive.includes(optionValue)) {
        // Exclusive option ticked - clear all others
        // But if it's "notSure", only clear "allInsulated", not other parts
        if (optionValue === 'notSure') {
          newValue = value.filter(v => !exclusive.includes(v)).concat([optionValue]);
        } else {
          newValue = [optionValue];
        }
      } else if (value.some(v => exclusive && exclusive.includes(v) && v !== 'notSure')) {
        // Another exclusive option (but not notSure) is ticked - replace it
        newValue = [optionValue];
      } else {
        // Normal checkbox - add to list
        newValue = [...value, optionValue];
      }
    }

    onChange(newValue);
  };

  return (
    <div className={`govuk-form-group ${error ? 'govuk-form-group--error' : ''}`}>
      <fieldset className="govuk-fieldset">
        <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
          <h1 className="govuk-fieldset__heading">{legend}</h1>
        </legend>
        {hint && <div className="govuk-hint">{hint}</div>}
        {error && <p className="govuk-error-message"><span className="govuk-visually-hidden">Error:</span> {error}</p>}
        <div className="govuk-checkboxes" data-module="govuk-checkboxes">
        {options.map((option, idx) => (
          <div key={option.value}>
            {dividerBefore && dividerBefore.includes(idx) && (
              <div className="govuk-checkboxes__divider">{dividerLabel}</div>
            )}
            <div className="govuk-checkboxes__item">
              <input
                className="govuk-checkboxes__input"
                id={idx === 0 ? name : `${name}-${idx}`}
                name={name}
                type="checkbox"
                value={option.value}
                checked={value.includes(option.value)}
                onChange={() => handleChange(option.value)}
              />
              <label className="govuk-label govuk-checkboxes__label" htmlFor={idx === 0 ? name : `${name}-${idx}`}>
                {option.label}
              </label>
            </div>
          </div>
        ))}
        </div>
      </fieldset>
    </div>
  );
}
