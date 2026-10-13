import { useEffect } from 'react';

const SERVICE_NAME = 'Check if you can get a Green Home Grant';

// Sets the document title in the GOV.UK format:
//   [Error: ]Page name - Service name - GOV.UK
// Pass an empty page name for the start page.
export function usePageTitle(pageName, hasError = false) {
  useEffect(() => {
    const parts = [pageName, SERVICE_NAME, 'GOV.UK'].filter(Boolean);
    document.title = `${hasError ? 'Error: ' : ''}${parts.join(' - ')}`;
  }, [pageName, hasError]);
}
