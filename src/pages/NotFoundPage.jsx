import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useLanguage } from '../content/language.jsx';

// GOV.UK "Page not found" pattern
export default function NotFoundPage() {
  const { t } = useLanguage();
  usePageTitle(t('notFound.title'));

  return (
    <>
      <h1 className="govuk-heading-l">{t('notFound.title')}</h1>
      <p className="govuk-body">{t('notFound.typed')}</p>
      <p className="govuk-body">{t('notFound.pasted')}</p>
      <p className="govuk-body">
        <Link to="/" className="govuk-link">{t('notFound.startLink')}</Link>
      </p>
    </>
  );
}
