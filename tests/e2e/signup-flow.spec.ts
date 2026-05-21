import { test, expect } from '@playwright/test'

test.describe('Signup form — desktop (1280×800)', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('form renders with email, password, confirm-password fields', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible()
    await expect(page.getByLabel('Confirm password')).toBeVisible()
  })

  test('submit button is disabled with empty form', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.getByRole('button', { name: /create account/i })).toBeDisabled()
  })

  test('email error shows after blurring empty field', async ({ page }) => {
    await page.goto('/signup')
    await page.getByLabel('Email').click()
    await page.keyboard.press('Tab')
    await expect(page.getByText('Email is required.')).toBeVisible()
  })

  test('password error shows when too short and blurred', async ({ page }) => {
    await page.goto('/signup')
    await page.getByLabel('Password', { exact: true }).fill('short')
    await page.keyboard.press('Tab')
    await expect(page.getByText('Password must be at least 8 characters.')).toBeVisible()
  })

  test("confirm-password mismatch error shows on blur", async ({ page }) => {
    await page.goto('/signup')
    await page.getByLabel('Password', { exact: true }).fill('password123')
    await page.getByLabel('Confirm password').fill('different')
    await page.getByLabel('Confirm password').press('Tab')
    await expect(page.getByText("Passwords don't match.")).toBeVisible()
  })

  test('tier label shows from ?tier query param', async ({ page }) => {
    await page.goto('/signup?tier=daily-bundle')
    await expect(page.getByText(/signing up for: daily bundle/i)).toBeVisible()
  })

  test('valid form submission navigates to /onboarding', async ({ page }) => {
    await page.goto('/signup')
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Password', { exact: true }).fill('password123')
    await page.getByLabel('Confirm password').fill('password123')
    await page.getByRole('button', { name: /create account/i }).click()
    await expect(page).toHaveURL(/\/onboarding/, { timeout: 15_000 })
  })
})

test.describe('Signup form — mobile (375×667)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('no horizontal overflow', async ({ page }) => {
    await page.goto('/signup')
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const clientWidth = await page.evaluate(() => document.body.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })

  test('inputs are at least 44px tall', async ({ page }) => {
    await page.goto('/signup')
    for (const label of ['Email', 'Password', 'Confirm password']) {
      const input = label === 'Password'
        ? page.getByLabel('Password', { exact: true })
        : page.getByLabel(label)
      const box = await input.boundingBox()
      expect(box).toBeTruthy()
      expect(box!.height).toBeGreaterThanOrEqual(44)
    }
  })
})
