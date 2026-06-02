import { test, expect } from '@playwright/test'

test.describe('Landing footer — desktop (1280×800)', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('footer renders with 3 link columns', async ({ page }) => {
    await page.goto('/')
    const footer = page.getByRole('contentinfo')
    await footer.scrollIntoViewIfNeeded()
    await expect(footer).toBeVisible()
    await expect(page.getByTestId('footer-column')).toHaveCount(3)
  })

  test('Mentions légales link navigates to /mentions-legales', async ({ page }) => {
    await page.goto('/')
    const link = page.getByRole('link', { name: /mentions légales/i })
    await link.scrollIntoViewIfNeeded()
    await link.click()
    await expect(page).toHaveURL(/\/mentions-legales/, { timeout: 15_000 })
  })

  test('Politique de confidentialité link navigates to /confidentialite', async ({ page }) => {
    await page.goto('/')
    const link = page.getByRole('link', { name: /politique de confidentialité/i })
    await link.scrollIntoViewIfNeeded()
    await link.click()
    await expect(page).toHaveURL(/\/confidentialite/, { timeout: 15_000 })
  })

  test('sticky header is visible after scrolling to bottom', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(page.getByTestId('sticky-header')).toBeVisible()
  })
})

test.describe('Landing footer — mobile (375×667)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('footer is visible', async ({ page }) => {
    await page.goto('/')
    const footer = page.getByRole('contentinfo')
    await footer.scrollIntoViewIfNeeded()
    await expect(footer).toBeVisible()
  })

  test('sticky header is visible on load', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('sticky-header')).toBeVisible()
  })
})
