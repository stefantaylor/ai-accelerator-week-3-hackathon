import { expect } from '@playwright/test';

export async function continueToNext(page) {
  await page.getByRole('button', { name: 'Continue' }).click();
}

export async function expectQuestion(page, question) {
  await expect(page.getByRole('heading', { level: 1, name: question })).toBeVisible();
}

// Answer every question on the main path and stop on Check your answers
export async function completeJourney(page, {
  priorGrants = ['No, I have not received a Green Home Grant'],
  propertyType = 'Detached',
  ownership = 'Own outright',
  consent,
  income = '£12,570 or less',
  uninsulatedParts = ['Loft or roof', 'Walls'],
  heating = 'Gas boiler',
} = {}) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Start now' }).click();

  await expectQuestion(page, 'Have you received a Green Home Grant before?');
  for (const grant of priorGrants) {
    await page.getByRole('checkbox', { name: grant, exact: true }).check();
  }
  await continueToNext(page);

  await expectQuestion(page, 'What type of property do you live in?');
  await page.getByRole('radio', { name: propertyType, exact: true }).check();
  await continueToNext(page);

  await expectQuestion(page, 'Do you own or rent your property?');
  await page.getByRole('radio', { name: ownership, exact: true }).check();
  await continueToNext(page);

  if (consent) {
    await page.getByRole('radio', { name: consent, exact: true }).check();
    await continueToNext(page);
  }

  await expectQuestion(page, 'What is your annual household income?');
  await page.getByRole('radio', { name: income, exact: true }).check();
  await continueToNext(page);

  await expectQuestion(page, 'Which parts of your property are not insulated?');
  for (const part of uninsulatedParts) {
    await page.getByRole('checkbox', { name: part, exact: true }).check();
  }
  await continueToNext(page);

  await expectQuestion(page, 'What is your main heating system?');
  await page.getByRole('radio', { name: heating, exact: true }).check();
  await continueToNext(page);

  await expect(page.getByRole('heading', { level: 1, name: 'Check your answers' })).toBeVisible();
}

export function summaryRow(page, key) {
  return page.locator('.govuk-summary-list__row', { has: page.locator('dt', { hasText: key }) });
}
