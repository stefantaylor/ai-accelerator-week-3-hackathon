import { contactEmail, contactPhone } from '../content/labels.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useLanguage } from '../content/language.jsx';

export default function AccessibilityStatementPage() {
  const { t } = useLanguage();
  usePageTitle(t('accessibility.title'));

  return (
    <>
      <h1 className="govuk-heading-xl">{t('accessibility.title')}</h1>
      <p className="govuk-body">{t('accessibility.appliesTo')}</p>

      <h2 className="govuk-heading-l">{t('accessibility.howAccessibleHeading')}</h2>
      <p className="govuk-body">{t('accessibility.compliance')}</p>
      <p className="govuk-body">{t('accessibility.knownIssues')}</p>
      <ul className="govuk-list govuk-list--bullet">
        <li>{t('accessibility.javascript')}</li>
      </ul>

      <h2 className="govuk-heading-l">{t('accessibility.contactHeading')}</h2>
      <p className="govuk-body">{t('accessibility.contactIntro')}</p>
      <ul className="govuk-list">
        <li>{t('accessibility.email')} <a href={`mailto:${contactEmail}`} className="govuk-link">{contactEmail}</a></li>
        <li>{t('accessibility.phone')} {contactPhone}</li>
      </ul>

      <h2 className="govuk-heading-l">{t('accessibility.reportingHeading')}</h2>
      <p className="govuk-body">{t('accessibility.reporting')}</p>

      <h2 className="govuk-heading-l">{t('accessibility.enforcementHeading')}</h2>
      <p className="govuk-body">
        {t('accessibility.enforcement')}{' '}
        <a href="https://www.equalityadvisoryservice.com/" className="govuk-link">
          {t('accessibility.enforcementLink')}
        </a>.
      </p>

      <h2 className="govuk-heading-l">{t('accessibility.technicalHeading')}</h2>
      <p className="govuk-body">{t('accessibility.technicalIntro')}</p>
      <ul className="govuk-list govuk-list--bullet">
        <li>{t('accessibility.react')}</li>
        <li>{t('accessibility.sessionStorage')}</li>
        <li>{t('accessibility.designSystem')}</li>
      </ul>

      <h2 className="govuk-heading-l">{t('accessibility.testingHeading')}</h2>
      <p className="govuk-body">{t('accessibility.testingAlpha')}</p>
      <p className="govuk-body">{t('accessibility.testingIncludes')}</p>
      <ul className="govuk-list govuk-list--bullet">
        <li>{t('accessibility.automated')}</li>
        <li>{t('accessibility.keyboard')}</li>
        <li>{t('accessibility.screenReader')}</li>
      </ul>

      <h2 className="govuk-heading-l">{t('accessibility.improveHeading')}</h2>
      <p className="govuk-body">{t('accessibility.improve')}</p>

      <h2 className="govuk-heading-l">{t('accessibility.preparationHeading')}</h2>
      <p className="govuk-body">{t('accessibility.preparation')}</p>
    </>
  );
}
