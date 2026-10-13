// GOV.UK Frontend button (v6.5.1), from components/button/template-default.html
// and template-start.html. data-module is left off: the GOV.UK Frontend
// JavaScript isn't run (spec §2.1).
function GovukButton({ children, onClick, type = 'button', variant = '' }) {
  const isStart = variant === 'start';
  const className = `govuk-button${isStart ? ' govuk-button--start' : ''}`;

  return (
    <button type={type} className={className} onClick={onClick}>
      {children}
      {isStart && (
        <svg
          className="govuk-button__start-icon"
          xmlns="http://www.w3.org/2000/svg"
          width="17.5"
          height="19"
          viewBox="0 0 33 40"
          aria-hidden="true"
          focusable="false"
        >
          <path fill="currentColor" d="M0 0h13l20 20-20 20H0l20-20z" />
        </svg>
      )}
    </button>
  );
}

export default GovukButton;
