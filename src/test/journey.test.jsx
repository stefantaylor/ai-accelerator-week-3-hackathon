import { describe, it, expect } from 'vitest';
import { screen, within, act } from '@testing-library/react';
import { renderApp, owner } from './renderApp';
import { STORAGE_KEY, load } from '../state/answersStore';
import { emptyAnswers } from '../state/answers';

const stored = () => window.sessionStorage.getItem(STORAGE_KEY);
const continueButton = () => screen.getByRole('button', { name: 'Continue' });
// GOV.UK markup is Change<span class="govuk-visually-hidden"> name</span>; the
// test library's name calculation drops the space before the hidden part.
const changeLink = (name) => screen.getByRole('link', { name: new RegExp(`^Change\\s*${name}$`) });

async function answerRadio(user, label) {
  await user.click(screen.getByLabelText(label));
  await user.click(continueButton());
}

async function answerCheckboxes(user, labels) {
  for (const label of labels) await user.click(screen.getByLabelText(label));
  await user.click(continueButton());
}

describe('full journey', () => {
  it('owner path ends on the result; AC5.8 answers are deleted but the result is shown', async () => {
    const { user, location } = renderApp('/');
    await user.click(screen.getByRole('button', { name: /Start now/ }));
    expect(location()).toBe('/prior-grants');

    await answerCheckboxes(user, ['No, I have not received a Green Home Grant']);
    await answerRadio(user, 'Detached');
    await answerRadio(user, 'Own outright');
    expect(location()).toBe('/income');
    await answerRadio(user, 'Under £12,570');
    await answerCheckboxes(user, ['Loft or roof', 'Floor']);
    await answerRadio(user, 'Gas boiler');
    expect(location()).toBe('/check-answers');
    expect(stored()).not.toBeNull();

    await user.click(screen.getByRole('button', { name: 'Accept and continue' }));
    expect(location()).toBe('/result');
    expect(stored()).toBeNull();

    // AC2.3
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('You may be eligible for a Green Home Grant');
    expect(screen.getByText('We could cover 100% of the cost')).toBeInTheDocument();
    expect(screen.getByText('loft or roof')).toBeInTheDocument();
    expect(screen.getByText('floor')).toBeInTheDocument();
    expect(screen.getByText('You may be eligible for a heat pump.')).toBeInTheDocument();
    expect(screen.getByText('We have deleted the answers you gave.')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Back' })).not.toBeInTheDocument();
  });

  it('AC5.9 after the result, the questions are empty again', async () => {
    const { user, location } = renderApp('/check-answers', { answers: owner });
    await user.click(screen.getByRole('button', { name: 'Accept and continue' }));
    expect(location()).toBe('/result');

    await user.click(screen.getByRole('link', { name: 'Check if you can get a Green Home Grant' }));
    await user.click(screen.getByRole('button', { name: /Start now/ }));
    expect(location()).toBe('/prior-grants');
    expect(document.querySelectorAll('input:checked')).toHaveLength(0);
  });

  it('renter with no permission is not eligible for either grant', async () => {
    const { user } = renderApp('/ownership', { answers: { ...owner, ownership: '' } });
    await answerRadio(user, 'Rent');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent("Do you have your landlord's permission for the work?");
    await answerRadio(user, 'No');
    await user.click(continueButton()); // income pre-filled
    await user.click(continueButton()); // insulation pre-filled
    await user.click(continueButton()); // heating pre-filled
    await user.click(screen.getByRole('button', { name: 'Accept and continue' }));
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('You are not eligible for a Green Home Grant');
    expect(document.querySelector('.govuk-panel')).not.toBeInTheDocument();
    expect(screen.getAllByText("You need your landlord's permission before you can apply.")).toHaveLength(2);
  });
});

describe('early exit', () => {
  it('AC3.1 / AC3.3 both grants received goes straight to the result, with no Back link and nothing stored', async () => {
    const { user, location } = renderApp('/prior-grants');
    await answerCheckboxes(user, ['Insulation grant', 'Heat pump grant']);
    expect(location()).toBe('/result');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('You are not eligible for a Green Home Grant');
    expect(document.querySelector('.govuk-panel')).not.toBeInTheDocument();
    expect(screen.getAllByText('You have already received this grant. You can only get one grant of each type.')).toHaveLength(2);
    expect(screen.queryByRole('link', { name: 'Back' })).not.toBeInTheDocument();
    expect(stored()).toBeNull();
  });
});

describe('Back links', () => {
  it('AC4.3 Back on /income goes to /consent for renters and /ownership for owners', () => {
    renderApp('/income', { answers: { ...owner, ownership: 'rent', consent: 'yes' } });
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/consent');
  });

  it('AC4.3 owner', () => {
    renderApp('/income', { answers: owner });
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/ownership');
  });

  it('goes to check answers in change mode', () => {
    renderApp('/heating?change=true', { answers: owner });
    expect(screen.getByRole('link', { name: 'Back' })).toHaveAttribute('href', '/check-answers');
  });

  it('the Back link sits before <main>, as in the GOV.UK page template', () => {
    renderApp('/heating', { answers: owner });
    const back = screen.getByRole('link', { name: 'Back' });
    expect(document.querySelector('main').contains(back)).toBe(false);
  });
});

describe('skipped questions (Q1)', () => {
  it('AC4a.4 insulation grant received: /income goes to /heating and check answers has no insulation row', async () => {
    const answers = { ...owner, priorGrants: ['insulation'], uninsulatedParts: [] };
    const { user, location } = renderApp('/income', { answers });
    await user.click(continueButton());
    expect(location()).toBe('/heating');
    await user.click(continueButton());
    expect(location()).toBe('/check-answers');
    expect(screen.queryByText('Parts not insulated')).not.toBeInTheDocument();
    expect(screen.getByText('Main heating system')).toBeInTheDocument();
  });

  it('AC4a.4 a deep link to a skipped question redirects past it', () => {
    const { location } = renderApp('/heating', { answers: { ...owner, priorGrants: ['heatPump'], heating: '' } });
    expect(location()).toBe('/check-answers');
  });

  it('AC4a.5 in change mode, removing the insulation grant asks the insulation question then returns', async () => {
    const answers = { ...owner, priorGrants: ['insulation'], uninsulatedParts: [] };
    const { user, location } = renderApp('/check-answers', { answers });
    await user.click(changeLink('previous green home grants'));
    expect(location()).toBe('/prior-grants?change=true');
    await user.click(screen.getByLabelText('Insulation grant'));
    await user.click(screen.getByLabelText('No, I have not received a Green Home Grant'));
    await user.click(continueButton());
    expect(location()).toBe('/insulation?change=true');
    await answerCheckboxes(user, ['Walls']);
    expect(location()).toBe('/check-answers');
    expect(screen.getByText('Parts not insulated')).toBeInTheDocument();
  });
});

describe('change mode', () => {
  it('owner changed to renter is asked for permission, then returns to check answers', async () => {
    const { user, location } = renderApp('/check-answers', { answers: owner });
    await user.click(changeLink('own or rent'));
    await answerRadio(user, 'Rent');
    expect(location()).toBe('/consent?change=true');
    await answerRadio(user, 'Yes');
    expect(location()).toBe('/check-answers');
    expect(screen.getByText('Permission for the work')).toBeInTheDocument();
  });

  it('renter changed to owner clears consent and returns to check answers', async () => {
    const { user, location } = renderApp('/ownership?change=true', { answers: { ...owner, ownership: 'rent', consent: 'no' } });
    await answerRadio(user, 'Own with a mortgage');
    expect(location()).toBe('/check-answers');
    expect(screen.queryByText('Permission for the work')).not.toBeInTheDocument();
    expect(load(Date.now()).answers.consent).toBe('');
  });

  it('changing prior grants to both types finishes the journey', async () => {
    const { user, location } = renderApp('/prior-grants?change=true', { answers: owner });
    await user.click(screen.getByLabelText('Insulation grant'));
    await user.click(screen.getByLabelText('Heat pump grant'));
    await user.click(continueButton());
    expect(location()).toBe('/result');
    expect(stored()).toBeNull();
  });
});

describe('check answers', () => {
  it('AC6.7 is a GOV.UK summary list with hidden context on Change links', () => {
    renderApp('/check-answers', { answers: owner });
    const list = document.querySelector('dl.govuk-summary-list');
    expect(list).toBeInTheDocument();
    expect(list.querySelectorAll('.govuk-summary-list__row')).toHaveLength(6);
    const change = changeLink('property type');
    expect(change.querySelector('.govuk-visually-hidden')).toHaveTextContent('property type');
    expect(change).toHaveAttribute('href', '/property-type?change=true');
  });

  it('shows several answers one per line', () => {
    renderApp('/check-answers', { answers: owner });
    const row = screen.getByText('Parts not insulated').closest('.govuk-summary-list__row');
    expect(within(row).getByText('Loft or roof')).toBeInTheDocument();
    expect(within(row).getByText('Walls')).toBeInTheDocument();
  });
});

describe('guards and other routes', () => {
  it('a deep link with missing answers redirects to the first missing question', () => {
    const { location } = renderApp('/heating', { answers: { ...owner, incomeBand: '' } });
    expect(location()).toBe('/income');
  });

  it('/result without a finished journey goes to the first question', () => {
    const { location } = renderApp('/result');
    expect(location()).toBe('/prior-grants');
  });

  it('shows Page not found for unknown URLs', () => {
    renderApp('/nope');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Page not found');
    expect(document.title).toBe('Page not found - Check if you can get a Green Home Grant - GOV.UK');
  });

  it('AC6.8 the phase banner and footer (with the accessibility link) are on every page', () => {
    renderApp('/');
    expect(screen.getByText('Alpha')).toHaveClass('govuk-tag');
    expect(screen.getByRole('link', { name: 'Accessibility statement' })).toHaveAttribute('href', '/accessibility-statement');
    expect(screen.getByRole('link', { name: 'Skip to main content' })).toHaveAttribute('href', '#main-content');
    expect(document.querySelector('main')).toHaveAttribute('id', 'main-content');
  });

  it('AC6.3 the accessibility statement has one main and one h1', () => {
    renderApp('/accessibility-statement');
    expect(document.querySelectorAll('main')).toHaveLength(1);
    expect(document.querySelectorAll('h1')).toHaveLength(1);
  });

  it('AC6.4 every non-question page sets its own title', () => {
    const titles = new Set();
    for (const path of ['/', '/accessibility-statement', '/session-expired', '/nope']) {
      const { unmount } = renderApp(path);
      titles.add(document.title);
      unmount();
    }
    const { unmount } = renderApp('/check-answers', { answers: owner });
    titles.add(document.title);
    unmount();
    expect(titles.size).toBe(5);
  });
});

describe('refresh', () => {
  it('AC5.1 a refresh keeps answers pre-filled', async () => {
    const first = renderApp('/prior-grants');
    await answerCheckboxes(first.user, ['No, I have not received a Green Home Grant']);
    await answerRadio(first.user, 'Flat');
    await answerRadio(first.user, 'Own outright');
    first.unmount();

    renderApp('/property-type'); // a fresh app reading sessionStorage
    expect(screen.getByLabelText('Flat')).toBeChecked();
  });

  it('AC5.7 Continue updates savedAt; a validation error and Back links do not', async () => {
    const savedAt = Date.now() - 60_000;
    const { user } = renderApp('/income', { answers: { ...owner, incomeBand: '' }, savedAt });
    const savedAtNow = () => JSON.parse(stored()).savedAt;

    await user.click(continueButton()); // validation error
    expect(savedAtNow()).toBe(savedAt);

    await user.click(screen.getByRole('link', { name: 'Back' }));
    expect(savedAtNow()).toBe(savedAt);

    await act(async () => {});
    await user.click(continueButton()); // ownership is pre-filled, so this is valid
    expect(savedAtNow()).toBeGreaterThan(savedAt);
  });

  it('starts empty when nothing is stored', () => {
    renderApp('/prior-grants');
    expect(load(Date.now()).answers).toEqual(emptyAnswers);
  });
});
