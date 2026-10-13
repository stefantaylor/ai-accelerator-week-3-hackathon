import { useEffect } from 'react';
import { SERVICE_NAME } from './ServiceNavigation';

// Sets document.title in the GOV.UK format (spec §2.3).
export default function usePageTitle(title, hasErrors = false) {
  useEffect(() => {
    document.title = `${hasErrors ? 'Error: ' : ''}${title} - ${SERVICE_NAME} - GOV.UK`;
  }, [title, hasErrors]);
}
