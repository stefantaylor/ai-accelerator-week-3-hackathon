import { test, expect } from '@playwright/test';
import { completeJourney, continueToNext, expectQuestion, summaryRow } from './helpers.js';

test.describe('Check your answers', () => {
  test('lists every answer, with multiple answers comma separated', async ({ page }) => {
    await completeJourney(page, {
      priorGrants: ['Insulation grant'],
      uninsulatedParts: ['Loft or roof', 'Walls', 'Floor'],
    });

    await expect(summaryRow(page, 'Green Home Grants received')).toContainText('Insulation grant');
    await expect(summaryRow(page, 'Property type')).toContainText('Detached');
    await expect(summaryRow(page, 'Ownership')).toContainText('Own outright');
    await expect(summaryRow(page, 'Household income')).toContainText('Under £12,570');
    await expect(summaryRow(page, 'Uninsulated parts')).toContainText('Loft or roof, Walls, Floor');
    await expect(summaryRow(page, 'Heating system')).toContainText('Gas boiler');
    await expect(page.locator('.govuk-summary-list ul')).toHaveCount(0);
  });

  test('Change returns to Check your answers after Continue', async ({ page }) => {
    await completeJourney(page);

    await page.getByRole('link', { name: 'Change property type', exact: true }).click();
    await expectQuestion(page, 'What type of property do you live in?');
    await page.getByRole('radio', { name: 'Flat', exact: true }).check();
    await continueToNext(page);

    await expect(page).toHaveURL(/\/check-answers$/);
    await expect(summaryRow(page, 'Property type')).toContainText('Flat');
  });

  test('a change that adds a question asks it before returning', async ({ page }) => {
    await completeJourney(page);

    await page.getByRole('link', { name: 'Change ownership', exact: true }).click();
    await page.getByRole('radio', { name: 'Shared ownership', exact: true }).check();
    await continueToNext(page);

    await expectQuestion(page, 'Do all owners of the property agree to the work?');
    await page.getByRole('radio', { name: 'Yes', exact: true }).check();
    await continueToNext(page);

    await expect(page).toHaveURL(/\/check-answers$/);
    await expect(summaryRow(page, 'All owners agree')).toContainText('Yes');
  });
});
