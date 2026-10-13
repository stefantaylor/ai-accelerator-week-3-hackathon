import { test, expect } from '@playwright/test';

test.describe('Cookie banner', () => {
  test('shows on first visit and stays hidden once answered', async ({ page }) => {
    await page.goto('/');
    const banner = page.getByRole('region', { name: /Cookies on/ });
    await expect(banner.getByRole('heading', { name: 'Cookies on our service' })).toBeVisible();

    await banner.getByRole('button', { name: 'Reject analytics cookies', exact: true }).click();
    await expect(banner.getByText('You’ve rejected additional cookies.')).toBeVisible();

    await banner.getByRole('button', { name: 'Hide cookie message', exact: true }).click();
    await expect(banner).toHaveCount(0);

    await page.reload();
    await expect(page.getByRole('region', { name: /Cookies on/ })).toHaveCount(0);
  });

  test('accepting shows the accepted message', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Accept analytics cookies', exact: true }).click();
    await expect(page.getByText('You’ve accepted additional cookies.')).toBeVisible();
  });
});

test.describe('Footer', () => {
  test('sits at the bottom of the window on a short page', async ({ page }) => {
    await page.setViewportSize({ width: 1000, height: 2500 });
    await page.goto('/property-type');

    const footer = await page.getByRole('contentinfo').boundingBox();
    expect(Math.round(footer.y + footer.height)).toBe(2500);
  });

  test('links to the accessibility statement', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('contentinfo').getByRole('link', { name: 'Accessibility statement', exact: true }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Accessibility statement' })).toBeVisible();
  });
});

test.describe('Small screens (320px)', () => {
  test.use({ viewport: { width: 320, height: 800 } });

  test('page does not scroll sideways', async ({ page }) => {
    for (const path of ['/', '/prior-grants', '/insulation']) {
      await page.goto(path);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `horizontal overflow on ${path}`).toBeLessThanOrEqual(0);
    }
  });

  test('question heading uses the GOV.UK mobile size', async ({ page }) => {
    await page.goto('/prior-grants');
    const heading = page.getByRole('heading', { level: 1, name: 'Have you received a Green Home Grant before?' });
    await expect(heading).toHaveCSS('font-size', '24px');
  });

  test('Continue button stretches the full width', async ({ page }) => {
    await page.goto('/prior-grants');
    const button = await page.getByRole('button', { name: 'Continue', exact: true }).boundingBox();
    const container = await page.locator('main').boundingBox();
    expect(Math.round(button.width)).toBe(Math.round(container.width));
  });
});

test.describe('Skip link', () => {
  test('moves focus to the main content', async ({ page }) => {
    await page.goto('/prior-grants');
    const skipLink = page.getByRole('link', { name: 'Skip to main content', exact: true });
    await skipLink.focus();
    await expect(skipLink).toBeVisible();
    await skipLink.press('Enter');
    await expect(page.locator('main')).toBeFocused();
  });
});

test.describe('Route guards', () => {
  test('opening /result directly goes to the first question', async ({ page }) => {
    await page.goto('/result');
    await expect(page).toHaveURL(/\/prior-grants$/);
    await expect(page.getByText('null%')).toHaveCount(0);
  });
});

test.describe('Moving between pages', () => {
  test('focus moves to the main content after Continue', async ({ page }) => {
    await page.goto('/prior-grants');
    await page.getByRole('checkbox', { name: 'No, I have not received a Green Home Grant', exact: true }).check();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();

    await expect(page.getByRole('heading', { level: 1, name: 'What type of property do you live in?' })).toBeVisible();
    await expect(page.locator('main')).toBeFocused();
  });

  test('pressing Enter on a radio submits the question', async ({ page }) => {
    await page.goto('/prior-grants');
    await page.getByRole('checkbox', { name: 'No, I have not received a Green Home Grant', exact: true }).check();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();

    const radio = page.getByRole('radio', { name: 'Flat', exact: true });
    await radio.check();
    await radio.press('Enter');
    await expect(page.getByRole('heading', { level: 1, name: 'Do you own or rent your property?' })).toBeVisible();
  });

  test('Back link is a real link to the previous page', async ({ page }) => {
    await page.goto('/prior-grants');
    await page.getByRole('checkbox', { name: 'No, I have not received a Green Home Grant', exact: true }).check();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();

    await expect(page.getByRole('link', { name: 'Back', exact: true })).toHaveAttribute('href', '/prior-grants');
  });

  test('unknown address shows the Page not found page', async ({ page }) => {
    await page.goto('/no-such-page');
    await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();
    await expect(page).toHaveTitle('Page not found - Check if you can get a Green Home Grant - GOV.UK');

    await page.getByRole('link', { name: 'Go to the start of the service', exact: true }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Check if you can get a Green Home Grant' })).toBeVisible();
  });
});

test.describe('Header', () => {
  test('GOV.UK logo links to the start page', async ({ page }) => {
    await page.goto('/prior-grants');
    const banner = page.getByRole('banner');
    await banner.getByRole('link', { name: 'GOV.UK', exact: true }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});
