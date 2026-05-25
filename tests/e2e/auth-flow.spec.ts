import { test, expect } from '@playwright/test'
import { injectAuthToken } from '../helpers/auth-e2e'

test.describe('Auth flow — redirect gate', () => {
  test('unauthenticated visitor on /dashboard is redirected to /', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/')
  })

  test('unauthenticated visitor on /la-methode is redirected to /', async ({ page }) => {
    await page.goto('/la-methode')
    await expect(page).toHaveURL('/')
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

  test('sidebar exposes a sign-out button', async ({ page }) => {
    await injectAuthToken(page)
    await page.goto('/dashboard')
    await expect(page.getByTestId('sidebar-signout')).toBeVisible()
  })
})
