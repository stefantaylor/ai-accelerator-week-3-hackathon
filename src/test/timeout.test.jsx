import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, act, fireEvent } from '@testing-library/react';
import { renderApp, owner } from './renderApp';
import { STORAGE_KEY } from '../state/answersStore';

const MINUTE = 60_000;
const stored = () => window.sessionStorage.getItem(STORAGE_KEY);
const advance = (ms) => act(() => vi.advanceTimersByTime(ms));
const warning = () => screen.queryByText('We will delete your answers in 2 minutes');

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
  vi.setSystemTime(new Date('2026-10-12T10:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('timeout warning and expiry', () => {
  it('AC8.1 no warning before 8 minutes; at 8 minutes a banner with role="alert" appears', () => {
    renderApp('/income', { answers: owner });
    advance(8 * MINUTE - 1);
    expect(warning()).not.toBeInTheDocument();
    advance(1);
    expect(warning()).toBeInTheDocument();
    const banner = warning().closest('.govuk-notification-banner');
    expect(banner).toHaveAttribute('role', 'alert');
    expect(screen.getByRole('button', { name: 'Keep my answers' })).toBeInTheDocument();
  });

  it('AC8.2 "Keep my answers" hides the banner and restarts the 10 minutes', () => {
    renderApp('/income', { answers: owner });
    const firstSavedAt = JSON.parse(stored()).savedAt;
    advance(8 * MINUTE);
    fireEvent.click(screen.getByRole('button', { name: 'Keep my answers' }));
    expect(warning()).not.toBeInTheDocument();
    expect(JSON.parse(stored()).savedAt).toBe(firstSavedAt + 8 * MINUTE);

    advance(8 * MINUTE - 1);
    expect(warning()).not.toBeInTheDocument();
    advance(1);
    expect(warning()).toBeInTheDocument();
  });

  it('AC8.3 at 10 minutes the answers are deleted and the user sees the expired page', () => {
    const { location } = renderApp('/income', { answers: owner });
    advance(10 * MINUTE);
    expect(location()).toBe('/session-expired');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Your answers have been deleted');
    expect(document.title).toBe('Your answers have been deleted - Check if you can get a Green Home Grant - GOV.UK');
    expect(stored()).toBeNull();
  });

  it('AC8.3 after expiry the question pages are empty', () => {
    const { location } = renderApp('/income', { answers: owner });
    advance(10 * MINUTE);
    fireEvent.click(screen.getByRole('button', { name: 'Start again' }));
    expect(location()).toBe('/');
    fireEvent.click(screen.getByRole('button', { name: /Start now/ }));
    expect(document.querySelectorAll('input:checked')).toHaveLength(0);
  });

  it('AC8.4 Continue after 10 minutes, before the timer fires, saves nothing and expires', () => {
    const { location } = renderApp('/income', { answers: owner });
    // Move the clock without running timers, as in a throttled background tab.
    vi.setSystemTime(Date.now() + 11 * MINUTE);
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(location()).toBe('/session-expired');
    expect(stored()).toBeNull();
  });

  it('expires as soon as a hidden tab becomes visible again', () => {
    const { location } = renderApp('/income', { answers: owner });
    vi.setSystemTime(Date.now() + 11 * MINUTE);
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(location()).toBe('/session-expired');
  });

  it('expired answers found on startup go to the expired page', () => {
    const { location } = renderApp('/heating', { answers: owner, savedAt: Date.now() - 11 * MINUTE });
    expect(location()).toBe('/session-expired');
    expect(stored()).toBeNull();
  });

  it('AC8.5 no warning before the first answer, on the result page or the expired page', () => {
    const start = renderApp('/');
    advance(20 * MINUTE);
    expect(warning()).not.toBeInTheDocument();
    start.unmount();

    renderApp('/check-answers', { answers: owner });
    fireEvent.click(screen.getByRole('button', { name: 'Accept and continue' }));
    advance(20 * MINUTE);
    expect(warning()).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('You may be eligible');
  });

  it('AC8.6 focus is not moved when the warning appears', () => {
    renderApp('/income', { answers: owner });
    const radio = screen.getByLabelText('Under £12,570');
    act(() => radio.focus());
    fireEvent.click(radio);
    expect(radio).toHaveFocus();
    advance(8 * MINUTE);
    expect(warning()).toBeInTheDocument();
    expect(radio).toHaveFocus();
  });
});
