import { useLanguage } from '../content/language.jsx';

export default function PhaseBanner({ feedbackHref = '#' }) {
  const { t } = useLanguage();

  return (
    <div className="govuk-phase-banner">
      <p className="govuk-phase-banner__content">
        <strong className="govuk-tag govuk-phase-banner__content__tag">{t('phaseBanner.tag')}</strong>
        <span className="govuk-phase-banner__text">
          {t('phaseBanner.before')}<a className="govuk-link" href={feedbackHref}>{t('phaseBanner.link')}</a>{t('phaseBanner.after')}
        </span>
      </p>
    </div>
  );
}
