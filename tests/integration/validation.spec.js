import { test, expect } from '@playwright/test';
import { continueToNext } from './helpers.js';

test.describe('Error messages', () => {
  test('continuing without an answer shows the GOV.UK error summary', async ({ page }) => {
    await page.goto('/prior-grants');
    await continueToNext(page);

    const summary = page.getByRole('alert');
    await expect(summary).toBeVisible();
    await expect(summary.getByRole('heading', { name: 'There is a problem' })).toBeVisible();
    await expect(summary).toBeFocused();
    await expect(page).toHaveTitle(/^Error: /);

    // The message also appears next to the question
    await expect(page.locator('.govuk-error-message')).toContainText(
      'Select if you have received a Green Home Grant before',
    );
  });

  test('error summary link moves focus to the question', async ({ page }) => {
    await page.goto('/prior-grants');
    await continueToNext(page);

    await page.getByRole('link', { name: 'Select if you have received a Green Home Grant before', exact: true }).click();
    await expect(page.getByRole('checkbox', { name: 'Insulation grant', exact: true })).toBeFocused();
  });

  test('error clears once the question is answered', async ({ page }) => {
    await page.goto('/prior-grants');
    await continueToNext(page);
    await page.getByRole('checkbox', { name: 'Heat pump grant', exact: true }).check();
    await continueToNext(page);

    await expect(page.getByRole('heading', { level: 1, name: 'What type of property do you live in?' })).toBeVisible();
    await expect(page.getByRole('alert')).toHaveCount(0);
  });

  test('choosing "No" to prior grants unticks the other options', async ({ page }) => {
    await page.goto('/prior-grants');
    await page.getByRole('checkbox', { name: 'Insulation grant', exact: true }).check();
    await page.getByRole('checkbox', { name: 'No, I have not received a Green Home Grant', exact: true }).check();

    await expect(page.getByRole('checkbox', { name: 'Insulation grant', exact: true })).not.toBeChecked();
  });
});
