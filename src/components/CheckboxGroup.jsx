import { Fragment } from 'react';
import QuestionFieldset, { inputId } from './QuestionFieldset';

// GOV.UK Frontend checkboxes (v6.5.1), from components/checkboxes fixture
// "with divider and None". Exclusive options are handled here in React state,
// not with GOV.UK Frontend's data-behaviour="exclusive" script (spec §2.1).
export default function CheckboxGroup({ name, legend, hint, options, value, onChange, error, exclusive = [], dividerBefore }) {
  const toggle = (optionValue) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
      return;
    }
    const next = exclusive.includes(optionValue)
      ? [optionValue]
      : [...value.filter((v) => !exclusive.includes(v)), optionValue];
    onChange(options.map((o) => o.value).filter((v) => next.includes(v)));
  };

  return (
    <QuestionFieldset name={name} legend={legend} hint={hint} error={error}>
      <div className="govuk-checkboxes">
        {options.map((option, index) => {
          const id = inputId(name, index);
          return (
            <Fragment key={option.value}>
              {option.value === dividerBefore && <div className="govuk-checkboxes__divider">or</div>}
              <div className="govuk-checkboxes__item">
                <input
                  className="govuk-checkboxes__input"
                  id={id}
                  name={name}
                  type="checkbox"
                  value={option.value}
                  checked={value.includes(option.value)}
                  onChange={() => toggle(option.value)}
                />
                <label className="govuk-label govuk-checkboxes__label" htmlFor={id}>
                  {option.label}
                </label>
              </div>
            </Fragment>
          );
        })}
      </div>
    </QuestionFieldset>
  );
}
