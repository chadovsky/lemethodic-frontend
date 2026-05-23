import { test, expect } from '@playwright/test'
import { injectAuthToken } from '../helpers/auth-e2e'

test.beforeEach(async ({ page }) => {
  await injectAuthToken(page)
  // Route /api/auth/me so useVerifyAuth resolves with a full user shape
  // (full_name + email_verified) rather than failing silently.
  await page.route('**/api/auth/me', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 1,
        email: 'test@example.com',
        full_name: 'Test User',
        is_admin: false,
        email_verified: true,
        current_level: null,
        target_level: null,
      }),
    })
  })
})

test.describe('Dashboard greeting — BE-002', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('"Bonjour" h1 is visible on /dashboard after auth injection', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByRole('heading', { level: 1, name: /bonjour/i })).toBeVisible()
  })

  test("today's date renders below the greeting (data-testid dashboard-today)", async ({
    page,
  }) => {
    await page.goto('/dashboard')
    await expect(page.getByTestId('dashboard-today')).toBeVisible()
  })

  test('email-verification banner is absent for verified users', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByTestId('email-verification-banner')).not.toBeVisible()
  })
})

test.describe('Dashboard greeting — email-verification banner', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('banner appears when user.emailVerified is false', async ({ page }) => {
    // Override the /api/auth/me route set in beforeEach with an unverified user.
    // Playwright routes are LIFO — this override fires before the beforeEach one.
    await page.route('**/api/auth/me', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          email: 'test@example.com',
          full_name: 'Test User',
          is_admin: false,
          email_verified: false,
        }),
      })
    })
    await page.goto('/dashboard')
    // Wait for useVerifyAuth to complete and update the store.
    await page.waitForTimeout(300)
    await expect(page.getByTestId('email-verification-banner')).toBeVisible()
  })
})
