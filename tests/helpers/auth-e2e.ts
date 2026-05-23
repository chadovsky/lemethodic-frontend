import type { Page } from '@playwright/test'

const FAKE_TOKEN = 'fake-jwt-token'
const FAKE_USER = { id: 1, email: 'test@example.com', full_name: 'Test User' }

/**
 * Inject a valid auth session into a Playwright page before navigation.
 * Sets localStorage token + mocks the /api/users/me endpoint so
 * ProtectedRoute's useVerifyAuth hook resolves immediately.
 * Must be called before page.goto().
 */
export async function injectAuthToken(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem('lemethodic_token', 'fake-jwt-token')
    localStorage.setItem(
      'lemethodic_user',
      JSON.stringify({ id: 1, email: 'test@example.com', full_name: 'Test User' }),
    )
  })
  await page.route('**/api/users/me', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(FAKE_USER),
    })
  })
}

/**
 * Mock the registration endpoint to avoid creating real users in CI/CD.
 * Returns a successful registration response.
 */
export async function mockRegisterEndpoint(page: Page): Promise<void> {
  await page.route('**/api/auth/register', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ access_token: FAKE_TOKEN, user: FAKE_USER }),
    })
  })
}
