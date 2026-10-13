import { useNavigate } from 'react-router-dom';
import { getLabel } from '../content/labels.js';
import { backRoute } from '../flow/journey.js';
import GovukButton from '../components/GovukButton';
import { useLanguage } from '../content/language.jsx';

function CheckAnswersPage({ answers, onAnswer }) {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  document.title = `${t('checkAnswers.title')} - ${t('titleSuffix')}`;

  const handleBack = () => {
    navigate(backRoute('/check-answers', answers));
  };

  const handleChange = (route) => {
    navigate(`${route}?change=true`);
  };

  const handleContinue = () => {
    navigate('/result');
  };

  return (
    <>
      <a href="#" className="govuk-back-link" onClick={(e) => { e.preventDefault(); handleBack(); }}>
        {t('back')}
      </a>

      <h1 className="govuk-heading-l">{t('checkAnswers.title')}</h1>

      <dl className="govuk-summary-list">
        {/* Prior Grants */}
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">{t('checkAnswers.priorGrants')}</dt>
          <dd className="govuk-summary-list__value">
            {answers.priorGrants.length === 0 ? (
              <span>{t('checkAnswers.noGrants')}</span>
            ) : answers.priorGrants.includes('none') ? (
              <span>{getLabel('priorGrants', 'none', lang)}</span>
            ) : (
              <span>{answers.priorGrants.map(grant => getLabel('priorGrants', grant, lang)).join(', ')}</span>
            )}
          </dd>
          <dd className="govuk-summary-list__actions">
            <a className="govuk-link" href="#" onClick={(e) => { e.preventDefault(); handleChange('/prior-grants'); }}>
              {t('change')}<span className="govuk-visually-hidden"> {t('checkAnswers.priorGrantsHidden')}</span>
            </a>
          </dd>
        </div>

        {/* Property Type */}
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">{t('checkAnswers.propertyType')}</dt>
          <dd className="govuk-summary-list__value">{getLabel('propertyType', answers.propertyType, lang)}</dd>
          <dd className="govuk-summary-list__actions">
            <a className="govuk-link" href="#" onClick={(e) => { e.preventDefault(); handleChange('/property-type'); }}>
              {t('change')}<span className="govuk-visually-hidden"> {t('checkAnswers.propertyTypeHidden')}</span>
            </a>
          </dd>
        </div>

        {/* Ownership */}
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">{t('checkAnswers.ownership')}</dt>
          <dd className="govuk-summary-list__value">{getLabel('ownership', answers.ownership, lang)}</dd>
          <dd className="govuk-summary-list__actions">
            <a className="govuk-link" href="#" onClick={(e) => { e.preventDefault(); handleChange('/ownership'); }}>
              {t('change')}<span className="govuk-visually-hidden"> {t('checkAnswers.ownershipHidden')}</span>
            </a>
          </dd>
        </div>

        {/* Consent (conditional) */}
        {(answers.ownership === 'sharedOwnership' || answers.ownership === 'rent') && (
          <div className="govuk-summary-list__row">
            <dt className="govuk-summary-list__key">
              {t(answers.ownership === 'sharedOwnership' ? 'checkAnswers.sharedConsent' : 'checkAnswers.rentConsent')}
            </dt>
            <dd className="govuk-summary-list__value">{getLabel('consent', answers.consent, lang)}</dd>
            <dd className="govuk-summary-list__actions">
              <a className="govuk-link" href="#" onClick={(e) => { e.preventDefault(); handleChange('/consent'); }}>
                {t('change')}<span className="govuk-visually-hidden"> {t('checkAnswers.consentHidden')}</span>
              </a>
            </dd>
          </div>
        )}

        {/* Income */}
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">{t('checkAnswers.income')}</dt>
          <dd className="govuk-summary-list__value">{getLabel('incomeBand', answers.incomeBand, lang)}</dd>
          <dd className="govuk-summary-list__actions">
            <a className="govuk-link" href="#" onClick={(e) => { e.preventDefault(); handleChange('/income'); }}>
              {t('change')}<span className="govuk-visually-hidden"> {t('checkAnswers.incomeHidden')}</span>
            </a>
          </dd>
        </div>

        {/* Uninsulated parts */}
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">{t('checkAnswers.uninsulatedParts')}</dt>
          <dd className="govuk-summary-list__value">
            {answers.uninsulatedParts.length === 0 ? (
              <span>{t('checkAnswers.notAnswered')}</span>
            ) : (
              <span>{answers.uninsulatedParts.map(part => getLabel('uninsulatedParts', part, lang)).join(', ')}</span>
            )}
          </dd>
          <dd className="govuk-summary-list__actions">
            <a className="govuk-link" href="#" onClick={(e) => { e.preventDefault(); handleChange('/insulation'); }}>
              {t('change')}<span className="govuk-visually-hidden"> {t('checkAnswers.uninsulatedPartsHidden')}</span>
            </a>
          </dd>
        </div>

        {/* Heating */}
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">{t('checkAnswers.heating')}</dt>
          <dd className="govuk-summary-list__value">{getLabel('heating', answers.heating, lang)}</dd>
          <dd className="govuk-summary-list__actions">
            <a className="govuk-link" href="#" onClick={(e) => { e.preventDefault(); handleChange('/heating'); }}>
              {t('change')}<span className="govuk-visually-hidden"> {t('checkAnswers.heatingHidden')}</span>
            </a>
          </dd>
        </div>
      </dl>

      <GovukButton onClick={handleContinue}>{t('checkAnswers.submit')}</GovukButton>
    </>
  );
}

export default CheckAnswersPage;
