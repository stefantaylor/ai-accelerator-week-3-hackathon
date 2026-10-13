import { test, expect } from '@playwright/test';
import { completeJourney, continueToNext, expectQuestion } from './helpers.js';

test.describe('Eligibility journey', () => {
  test('eligible owner sees both grants and their support level', async ({ page }) => {
    await completeJourney(page);
    await page.getByRole('button', { name: 'Accept and continue', exact: true }).click();

    await expect(page).toHaveURL(/\/result$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('You may be eligible for a Green Home Grant');
    await expect(page.getByText('We could cover 100% of the cost')).toBeVisible();
    await expect(page.getByRole('listitem').filter({ hasText: 'Loft or roof' })).toBeVisible();
    await expect(page.getByRole('listitem').filter({ hasText: 'Walls' })).toBeVisible();
    await expect(page.getByText('You may be eligible for a heat pump grant.')).toBeVisible();
  });

  test('support level follows household income', async ({ page }) => {
    await completeJourney(page, { income: '£50,271 to £125,140' });
    await page.getByRole('button', { name: 'Accept and continue', exact: true }).click();

    await expect(page.getByText('We could cover 50% of the cost')).toBeVisible();
  });

  test('someone who has had both grants goes straight to the result', async ({ page }) => {
    await page.goto('/prior-grants');
    await page.getByRole('checkbox', { name: 'Insulation grant', exact: true }).check();
    await page.getByRole('checkbox', { name: 'Heat pump grant', exact: true }).check();
    await continueToNext(page);

    await expect(page).toHaveURL(/\/result$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('You are not eligible for a Green Home Grant');
  });

  test('renters are asked for landlord permission and are not eligible without it', async ({ page }) => {
    await page.goto('/prior-grants');
    await page.getByRole('checkbox', { name: 'No, I have not received a Green Home Grant', exact: true }).check();
    await continueToNext(page);
    await page.getByRole('radio', { name: 'Flat', exact: true }).check();
    await continueToNext(page);
    await page.getByRole('radio', { name: 'Rent', exact: true }).check();
    await continueToNext(page);

    await expectQuestion(page, "Do you have your landlord's permission for the work?");
    await page.getByRole('radio', { name: 'No', exact: true }).check();
    await continueToNext(page);

    await page.getByRole('radio', { name: '£12,570 or less', exact: true }).check();
    await continueToNext(page);
    await page.getByRole('checkbox', { name: 'Walls', exact: true }).check();
    await continueToNext(page);
    await page.getByRole('radio', { name: 'Gas boiler', exact: true }).check();
    await continueToNext(page);
    await page.getByRole('button', { name: 'Accept and continue', exact: true }).click();

    await expect(page.getByRole('heading', { level: 1 })).toHaveText('You are not eligible for a Green Home Grant');
    await expect(page.getByText("You need your landlord's permission before you can apply.").first()).toBeVisible();
  });

  test('owners are not asked for consent', async ({ page }) => {
    await page.goto('/prior-grants');
    await page.getByRole('checkbox', { name: 'No, I have not received a Green Home Grant', exact: true }).check();
    await continueToNext(page);
    await page.getByRole('radio', { name: 'Detached', exact: true }).check();
    await continueToNext(page);
    await page.getByRole('radio', { name: 'Mortgage', exact: true }).check();
    await continueToNext(page);

    await expectQuestion(page, 'What is your annual household income?');
  });

  test('Back link returns to the previous question with the answer kept', async ({ page }) => {
    await page.goto('/prior-grants');
    await page.getByRole('checkbox', { name: 'No, I have not received a Green Home Grant', exact: true }).check();
    await continueToNext(page);
    await page.getByRole('radio', { name: 'Terraced', exact: true }).check();
    await continueToNext(page);

    await page.getByRole('link', { name: 'Back', exact: true }).click();
    await expectQuestion(page, 'What type of property do you live in?');
    await expect(page.getByRole('radio', { name: 'Terraced', exact: true })).toBeChecked();
  });

  test('Start again clears every answer', async ({ page }) => {
    await completeJourney(page);
    await page.getByRole('button', { name: 'Accept and continue', exact: true }).click();
    await page.getByRole('button', { name: 'Start again', exact: true }).click();

    await expectQuestion(page, 'Have you received a Green Home Grant before?');
    for (const checkbox of await page.getByRole('checkbox').all()) {
      await expect(checkbox).not.toBeChecked();
    }

    // Answers do not come back after a reload
    await page.reload();
    await expect(page.getByRole('checkbox', { name: 'No, I have not received a Green Home Grant', exact: true })).not.toBeChecked();
  });

  test('answers survive a page reload', async ({ page }) => {
    await page.goto('/prior-grants');
    await page.getByRole('checkbox', { name: 'No, I have not received a Green Home Grant', exact: true }).check();
    await continueToNext(page);
    await page.getByRole('radio', { name: 'Bungalow', exact: true }).check();
    await continueToNext(page);

    await page.reload();
    await page.getByRole('link', { name: 'Back', exact: true }).click();
    await expect(page.getByRole('radio', { name: 'Bungalow', exact: true })).toBeChecked();
  });
});
