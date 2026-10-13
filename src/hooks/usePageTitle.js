import { useEffect } from 'react';
import { useLanguage } from '../content/language.jsx';

// Sets the document title in the GOV.UK format, in the current language:
//   [Error: ]Page name - Service name - GOV.UK
// Pass an empty page name for the start page.
export function usePageTitle(pageName, hasError = false) {
  const { t } = useLanguage();
  const serviceName = t('serviceName');
  const errorPrefix = t('errorPrefix');

  useEffect(() => {
    const parts = [pageName, serviceName, 'GOV.UK'].filter(Boolean);
    document.title = `${hasError ? `${errorPrefix} ` : ''}${parts.join(' - ')}`;
  }, [pageName, hasError, serviceName, errorPrefix]);
}
