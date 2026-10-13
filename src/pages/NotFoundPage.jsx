import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle.js';

// GOV.UK "Page not found" pattern
export default function NotFoundPage() {
  usePageTitle('Page not found');

  return (
    <>
      <h1 className="govuk-heading-l">Page not found</h1>
      <p className="govuk-body">If you typed the web address, check it is correct.</p>
      <p className="govuk-body">If you pasted the web address, check you copied the entire address.</p>
      <p className="govuk-body">
        <Link to="/" className="govuk-link">Go to the start of the service</Link>
      </p>
    </>
  );
}
