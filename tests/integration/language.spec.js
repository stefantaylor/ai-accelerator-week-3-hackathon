import { test, expect } from '@playwright/test';
import { expectQuestion } from './helpers.js';

function languageSwitcher(page, name) {
  return page.getByRole('navigation', { name });
}

test.describe('Welsh language', () => {
  test('page is in English by default with a link to Welsh', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    const nav = languageSwitcher(page, 'Language switcher');
    await expect(nav.getByText('English')).toHaveAttribute('aria-current', 'true');
    const welsh = nav.getByRole('link', { name: 'Newid yr iaith i’r Gymraeg' });
    await expect(welsh).toHaveAttribute('lang', 'cy');
    await expect(welsh).toHaveAttribute('hreflang', 'cy');
  });

  test('switching to Welsh translates the page and sets the page language', async ({ page }) => {
    await page.goto('/property-type');
    await languageSwitcher(page, 'Language switcher').getByRole('link', { name: 'Newid yr iaith i’r Gymraeg' }).click();

    await expect(page.locator('html')).toHaveAttribute('lang', 'cy');
    await expect(page).toHaveTitle('Ydych chi wedi cael Grant Cartref Gwyrdd o’r blaen? - Gwirio a allwch gael Grant Cartref Gwyrdd - GOV.UK');
    await expectQuestion(page, 'Ydych chi wedi cael Grant Cartref Gwyrdd o’r blaen?');
    await expect(page.getByRole('link', { name: 'Yn ôl' })).toBeVisible();
    await expect(page.getByRole('checkbox', { name: 'Grant inswleiddio' })).toBeVisible();

    // Focus stays in the switcher, on the link back to English
    await expect(languageSwitcher(page, 'Newid iaith').getByRole('link', { name: 'Change the language to English' })).toBeFocused();
  });

  test('Welsh error messages follow the GOV.UK pattern', async ({ page }) => {
    await page.goto('/?lang=cy');
    await page.getByRole('button', { name: 'Dechrau nawr' }).click();
    await page.getByRole('button', { name: 'Parhau' }).click();

    const summary = page.getByRole('alert');
    await expect(summary.getByRole('heading', { name: 'Mae problem wedi codi' })).toBeVisible();
    await expect(summary.getByRole('link', { name: 'Dewiswch a ydych wedi cael Grant Cartref Gwyrdd o’r blaen' })).toBeVisible();
    await expect(page.locator('.govuk-error-message')).toHaveText('Gwall: Dewiswch a ydych wedi cael Grant Cartref Gwyrdd o’r blaen');
    await expect(page).toHaveTitle(/^Gwall: /);
  });

  test('Page not found is in Welsh', async ({ page }) => {
    await page.goto('/no-such-page?lang=cy');
    await expect(page.getByRole('heading', { level: 1, name: 'Heb ddod o hyd i’r dudalen' })).toBeVisible();
    await expect(page).toHaveTitle('Heb ddod o hyd i’r dudalen - Gwirio a allwch gael Grant Cartref Gwyrdd - GOV.UK');
  });

  test('choice is remembered across pages and can be switched back', async ({ page }) => {
    await page.goto('/?lang=cy');
    await page.getByRole('button', { name: 'Dechrau nawr' }).click();
    await page.getByRole('checkbox', { name: 'Nac ydw, nid wyf wedi cael Grant Cartref Gwyrdd' }).check();
    await page.getByRole('button', { name: 'Parhau' }).click();
    await expectQuestion(page, 'Pa fath o eiddo ydych chi’n byw ynddo?');

    await page.reload();
    await expectQuestion(page, 'Pa fath o eiddo ydych chi’n byw ynddo?');

    await page.getByRole('link', { name: 'Change the language to English' }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expectQuestion(page, 'What type of property do you live in?');
  });
});
