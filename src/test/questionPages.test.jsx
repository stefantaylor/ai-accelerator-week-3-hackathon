import { describe, it, expect } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderApp, owner } from './renderApp';

const renter = { ...owner, ownership: 'rent', consent: 'yes' };

// Each question page, with answers that let the guard show it.
const PAGES = [
  { path: '/prior-grants', answers: owner, question: 'Have you received a Green Home Grant before?' },
  { path: '/property-type', answers: owner, question: 'What type of property do you live in?' },
  { path: '/ownership', answers: owner, question: 'Do you own or rent your property?' },
  { path: '/consent', answers: renter, question: "Do you have your landlord's permission for the work?" },
  { path: '/income', answers: owner, question: 'What is your annual household income?' },
  { path: '/insulation', answers: owner, question: 'Which parts of your property are not insulated?' },
  { path: '/heating', answers: owner, question: 'What is your main heating system?' },
];

describe.each(PAGES)('question page $path', ({ path, answers, question }) => {
  // Clear this page's answer so Continue gives an error.
  const field = {
    '/prior-grants': 'priorGrants',
    '/property-type': 'propertyType',
    '/ownership': 'ownership',
    '/consent': 'consent',
    '/income': 'incomeBand',
    '/insulation': 'uninsulatedParts',
    '/heating': 'heating',
  }[path];
  const unanswered = { ...answers, [field]: Array.isArray(answers[field]) ? [] : '' };

  it('AC6.1 / AC6.4 Continue with no answer shows the GOV.UK error summary and Error: title', async () => {
    const { user } = renderApp(path, { answers: unanswered });
    expect(document.title).toBe(`${question} - Check if you can get a Green Home Grant - GOV.UK`);

    await user.click(screen.getByRole('button', { name: 'Continue' }));

    const alert = screen.getByRole('alert');
    expect(within(alert).getByRole('heading', { name: 'There is a problem' })).toBeInTheDocument();
    const links = within(alert).getAllByRole('link');
    expect(links).toHaveLength(1);
    const target = links[0].getAttribute('href').slice(1);
    expect(document.getElementById(target)).toBeInstanceOf(HTMLInputElement);
    expect(document.title.startsWith('Error: ')).toBe(true);
    expect(document.querySelector('.govuk-form-group--error')).toBeInTheDocument();
    expect(document.querySelector('.govuk-error-message')).toHaveTextContent(`Error: ${links[0].textContent}`);
  });

  it('AC6.2 every input has a label and the group is a fieldset with the question as legend', () => {
    renderApp(path, { answers: unanswered });
    const group = screen.getByRole('group', { name: question });
    expect(group.tagName).toBe('FIELDSET');
    const inputs = group.querySelectorAll('input');
    expect(inputs.length).toBeGreaterThan(1);
    inputs.forEach((input) => expect(document.querySelector(`label[for="${input.id}"]`)).toBeInTheDocument());
  });

  it('AC6.3 has exactly one h1 and one main', () => {
    renderApp(path, { answers: unanswered });
    expect(document.querySelectorAll('h1')).toHaveLength(1);
    expect(document.querySelectorAll('main')).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(question);
  });

  it('pre-fills the saved answer', () => {
    renderApp(path, { answers });
    const checked = document.querySelectorAll('input:checked');
    expect(checked.length).toBeGreaterThan(0);
  });
});

describe('exclusive checkboxes', () => {
  it('AC1.6a on /insulation, "All parts are insulated" and "I\'m not sure" clear other options', async () => {
    const { user } = renderApp('/insulation', { answers: { ...owner, uninsulatedParts: [] } });
    const loft = screen.getByLabelText('Loft or roof');
    const walls = screen.getByLabelText('Walls');
    const all = screen.getByLabelText('All parts are insulated');
    const notSure = screen.getByLabelText("I'm not sure");

    await user.click(loft);
    await user.click(walls);
    await user.click(all);
    expect(all).toBeChecked();
    expect(loft).not.toBeChecked();
    expect(walls).not.toBeChecked();

    await user.click(notSure);
    expect(notSure).toBeChecked();
    expect(all).not.toBeChecked();

    await user.click(loft);
    expect(loft).toBeChecked();
    expect(notSure).not.toBeChecked();
  });

  it('on /prior-grants, "No" clears the grant types and a grant type clears "No"', async () => {
    const { user } = renderApp('/prior-grants');
    const insulation = screen.getByLabelText('Insulation grant');
    const none = screen.getByLabelText('No, I have not received a Green Home Grant');
    await user.click(insulation);
    await user.click(none);
    expect(insulation).not.toBeChecked();
    await user.click(insulation);
    expect(none).not.toBeChecked();
  });
});

describe('consent page', () => {
  it('AC4.1 uses wording for shared ownership', () => {
    renderApp('/consent', { answers: { ...owner, ownership: 'sharedOwnership', consent: '' } });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Do all owners of the property agree to the work?');
  });
});
