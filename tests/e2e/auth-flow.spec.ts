import { test, expect } from '@playwright/test'
import { injectAuthToken } from '../helpers/auth-e2e'

test.describe('Auth flow — redirect gate', () => {
  test('unauthenticated visitor on /dashboard is redirected to /', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/')
  })

  test('unauthenticated visitor on /la-methode sees the lesson list (not redirected)', async ({ page }) => {
    await page.goto('/la-methode')
    await expect(page).toHaveURL('/la-methode')
  })

  test('unauthenticated visitor on /la-bibliotheque is redirected to /', async ({ page }) => {
    await page.goto('/la-bibliotheque')
    await expect(page).toHaveURL('/')
  })

  test('authenticated user on /dashboard sees the app shell', async ({ page }) => {
    await injectAuthToken(page)
    await page.goto('/dashboard')
    await expect(page.getByTestId('app-shell-sidebar')).toBeVisible()
  })

  test('authenticated user on /la-methode sees the app shell', async ({ page }) => {
    await injectAuthToken(page)
    await page.goto('/la-methode')
    await expect(page.getByTestId('app-shell-sidebar')).toBeVisible()
  })

  // F-455 — logout deduped out of the sidebar; it lives solely in the user
  // dropdown (top bar). Sidebar must no longer carry a sign-out affordance.
  test('logout lives in the user menu, not the sidebar', async ({ page }) => {
    await injectAuthToken(page)
    await page.goto('/dashboard')
    await expect(page.getByTestId('sidebar-signout')).toHaveCount(0)
    await page.getByTestId('user-menu-trigger').click()
    await expect(page.getByTestId('user-menu-signout')).toBeVisible()
  })
})
