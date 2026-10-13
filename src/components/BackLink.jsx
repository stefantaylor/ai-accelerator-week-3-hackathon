import { Link } from 'react-router-dom';

// GOV.UK Frontend back link (v6.5.1), rendered as a router link.
export default function BackLink({ to }) {
  return (
    <Link to={to} className="govuk-back-link">
      Back
    </Link>
  );
}
