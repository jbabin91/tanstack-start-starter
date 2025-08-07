import { expect, test } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Tanstack Start Starter/);
});

test('login page', async ({ page }) => {
  await page.goto('/login');

  // Wait for the page to load and check for login elements
  await page.waitForLoadState('networkidle');

  // Check if we got redirected (auth route redirects logged-in users)
  const currentUrl = page.url();
  if (currentUrl.includes('/dashboard')) {
    // User is already logged in, skip login form test
    console.log('User already logged in, redirected to dashboard');
    return;
  }

  // Wait for loading spinner to disappear and form to appear
  // First wait for any loading indicators to disappear
  const loadingSpinner = page.locator(
    '[data-testid="loading"], .animate-spin, [aria-label="Loading"]',
  );
  if ((await loadingSpinner.count()) > 0) {
    await expect(loadingSpinner).toBeHidden();
  }

  // Now expect the login form to be present
  // CardTitle renders as a div, not a heading, so we use getByText
  await expect(page.getByText('Welcome back')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByLabel('Email address')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
});

test('navigation', async ({ page }) => {
  await page.goto('/');

  // Test navigation to login page
  await page.getByRole('link', { name: 'Sign In' }).click();
  await expect(page).toHaveURL('/login');

  // Test navigation back to home
  await page.getByRole('link', { name: 'TanStack Start' }).click();
  await expect(page).toHaveURL('/');
});
