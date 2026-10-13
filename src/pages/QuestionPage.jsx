import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ErrorSummary from '../components/ErrorSummary';
import RadioGroup from '../components/RadioGroup';
import CheckboxGroup from '../components/CheckboxGroup';
import GovukButton from '../components/GovukButton';
import usePageTitle from '../components/usePageTitle';
import { isAnswered, isEarlyExit, setAnswer } from '../state/answers';
import { nextRoute, nextRouteInChangeMode } from '../flow/journey';

// One question per page (spec §4.2). Each page file passes its own settings.
export default function QuestionPage({
  route,
  field,
  control,
  question,
  hint,
  options,
  errorMessage,
  exclusive,
  dividerBefore,
  answers,
  onAnswer,
  onFinish,
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const changeMode = searchParams.get('change') === 'true';
  const [value, setValue] = useState(answers[field]);
  const [errors, setErrors] = useState([]);
  usePageTitle(question, errors.length > 0);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!isAnswered(value)) {
      setErrors([{ fieldId: field, message: errorMessage }]);
      return;
    }
    const finalAnswers = setAnswer(answers, field, value);
    if (route === '/prior-grants' && isEarlyExit(finalAnswers)) {
      onFinish(finalAnswers);
      return;
    }
    const saved = onAnswer(field, value);
    if (!saved) return; // answers had expired
    navigate(changeMode ? nextRouteInChangeMode(saved) : nextRoute(route, saved));
  };

  const error = errors[0]?.message;
  const Group = control === 'checkbox' ? CheckboxGroup : RadioGroup;

  return (
    <div className="govuk-grid-row">
      <div className="govuk-grid-column-two-thirds">
        <ErrorSummary errors={errors} />
        <form onSubmit={handleSubmit} noValidate>
          <Group
            name={field}
            legend={question}
            hint={hint}
            options={options}
            value={value}
            onChange={setValue}
            error={error}
            exclusive={exclusive}
            dividerBefore={dividerBefore}
          />
          <GovukButton type="submit">Continue</GovukButton>
        </form>
      </div>
    </div>
  );
}
