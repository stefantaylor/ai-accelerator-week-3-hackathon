import { Link, useNavigate } from 'react-router-dom';
import { getLabel } from '../content/labels.js';
import { backRoute } from '../flow/journey.js';
import GovukButton from '../components/GovukButton';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useLanguage } from '../content/language.jsx';

function SummaryRow({ label, value, changeRoute, hiddenText }) {
  const { t } = useLanguage();

  return (
    <div className="govuk-summary-list__row">
      <dt className="govuk-summary-list__key">{label}</dt>
      <dd className="govuk-summary-list__value">{value}</dd>
      <dd className="govuk-summary-list__actions">
        <Link className="govuk-link" to={`${changeRoute}?change=true`}>
          {t('change')}<span className="govuk-visually-hidden"> {hiddenText}</span>
        </Link>
      </dd>
    </div>
  );
}

function CheckAnswersPage({ answers }) {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  usePageTitle(t('checkAnswers.title'));

  const consentRequired = answers.ownership === 'sharedOwnership' || answers.ownership === 'rent';

  const priorGrantsValue = answers.priorGrants.includes('none')
    ? getLabel('priorGrants', 'none', lang)
    : answers.priorGrants.map(grant => getLabel('priorGrants', grant, lang)).join(', ');

  return (
    <>
      <Link to={backRoute('/check-answers', answers)} className="govuk-back-link">{t('back')}</Link>

      <h1 className="govuk-heading-l">{t('checkAnswers.title')}</h1>

      <dl className="govuk-summary-list">
        <SummaryRow
          label={t('checkAnswers.priorGrants')}
          value={priorGrantsValue}
          changeRoute="/prior-grants"
          hiddenText={t('checkAnswers.priorGrantsHidden')}
        />
        <SummaryRow
          label={t('checkAnswers.propertyType')}
          value={getLabel('propertyType', answers.propertyType, lang)}
          changeRoute="/property-type"
          hiddenText={t('checkAnswers.propertyTypeHidden')}
        />
        <SummaryRow
          label={t('checkAnswers.ownership')}
          value={getLabel('ownership', answers.ownership, lang)}
          changeRoute="/ownership"
          hiddenText={t('checkAnswers.ownershipHidden')}
        />
        {consentRequired && (
          <SummaryRow
            label={t(answers.ownership === 'sharedOwnership' ? 'checkAnswers.sharedConsent' : 'checkAnswers.rentConsent')}
            value={getLabel('consent', answers.consent, lang)}
            changeRoute="/consent"
            hiddenText={t('checkAnswers.consentHidden')}
          />
        )}
        <SummaryRow
          label={t('checkAnswers.income')}
          value={getLabel('incomeBand', answers.incomeBand, lang)}
          changeRoute="/income"
          hiddenText={t('checkAnswers.incomeHidden')}
        />
        <SummaryRow
          label={t('checkAnswers.uninsulatedParts')}
          value={answers.uninsulatedParts.map(part => getLabel('uninsulatedParts', part, lang)).join(', ')}
          changeRoute="/insulation"
          hiddenText={t('checkAnswers.uninsulatedPartsHidden')}
        />
        <SummaryRow
          label={t('checkAnswers.heating')}
          value={getLabel('heating', answers.heating, lang)}
          changeRoute="/heating"
          hiddenText={t('checkAnswers.heatingHidden')}
        />
      </dl>

      <GovukButton onClick={() => navigate('/result')}>{t('checkAnswers.submit')}</GovukButton>
    </>
  );
}

export default CheckAnswersPage;
