import { Fragment } from 'react';
import QuestionFieldset, { inputId } from './QuestionFieldset';

// GOV.UK Frontend radios (v6.5.1), from components/radios.
export default function RadioGroup({ name, legend, hint, options, value, onChange, error, dividerBefore }) {
  return (
    <QuestionFieldset name={name} legend={legend} hint={hint} error={error}>
      <div className="govuk-radios">
        {options.map((option, index) => {
          const id = inputId(name, index);
          return (
            <Fragment key={option.value}>
              {option.value === dividerBefore && <div className="govuk-radios__divider">or</div>}
              <div className="govuk-radios__item">
                <input
                  className="govuk-radios__input"
                  id={id}
                  name={name}
                  type="radio"
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => onChange(option.value)}
                />
                <label className="govuk-label govuk-radios__label" htmlFor={id}>
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
