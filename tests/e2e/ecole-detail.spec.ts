import { test, expect } from '@playwright/test'
import { injectAuthToken } from '../helpers/auth-e2e'

test.beforeEach(async ({ page }) => {
  await injectAuthToken(page)
})


test.describe("L'Ã‰cole lesson detail â€” desktop (1280Ã—800)", () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('renders inside the (app) shell with breadcrumb, header, audio placeholder, sections, nav', async ({
    page,
  }) => {
    await page.goto('/ecole/3')
    await expect(page.getByTestId('app-shell-sidebar')).toBeVisible()
    await expect(page.getByTestId('lesson-breadcrumb')).toBeVisible()
    await expect(page.getByTestId('lesson-section-badge')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByTestId('audio-player-placeholder')).toBeVisible()
    await expect(page.getByTestId('lesson-section-introduction')).toBeVisible()
    await expect(page.getByTestId('lesson-section-methode')).toBeVisible()
    await expect(page.getByTestId('lesson-section-pratique')).toBeVisible()
    await expect(page.getByTestId('lesson-nav-prev')).toBeVisible()
    await expect(page.getByTestId('lesson-nav-next')).toBeVisible()
  })

  test('clicking next on /ecole/3 navigates to /ecole/4', async ({ page }) => {
    await page.goto('/ecole/3')
    await page.getByTestId('lesson-nav-next').click()
    await expect(page).toHaveURL(/\/ecole\/4$/)
  })

  test('/ecole/1 â€” no previous button, next links to /ecole/2', async ({ page }) => {
    await page.goto('/ecole/1')
    await expect(page.getByTestId('lesson-nav-prev')).toHaveCount(0)
    await expect(page.getByTestId('lesson-nav-next')).toHaveAttribute('href', '/ecole/2')
  })

  test('/ecole/27 â€” no next button, prev links to /ecole/26', async ({ page }) => {
    await page.goto('/ecole/27')
    await expect(page.getByTestId('lesson-nav-next')).toHaveCount(0)
    await expect(page.getByTestId('lesson-nav-prev')).toHaveAttribute('href', '/ecole/26')
  })

  test('/ecole/99 â€” renders Next.js 404', async ({ page }) => {
    const response = await page.goto('/ecole/99')
    expect(response?.status()).toBe(404)
  })

  test('/ecole/abc â€” renders Next.js 404 (non-numeric id)', async ({ page }) => {
    const response = await page.goto('/ecole/abc')
    expect(response?.status()).toBe(404)
  })

  test('lesson card #5 on /ecole resolves to /ecole/5 detail page', async ({ page }) => {
    await page.goto('/ecole')
    await page.locator('[data-testid="lesson-card"][data-lesson-id="5"]').click()
    await expect(page).toHaveURL(/\/ecole\/5$/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByTestId('audio-player-placeholder')).toBeVisible()
  })

  // MOCK-008 â€” waveform bars, keyboard navigation
  test('audio player shows 15 waveform bars on /ecole/3', async ({ page }) => {
    await page.goto('/ecole/3')
    await expect(page.getByTestId('lesson-waveform-bar')).toHaveCount(15)
  })

  test('ArrowRight on /ecole/3 navigates to /ecole/4', async ({ page }) => {
    await page.goto('/ecole/3')
    await page.keyboard.press('ArrowRight')
    await expect(page).toHaveURL(/\/ecole\/4$/)
  })

  test('ArrowLeft on /ecole/3 navigates to /ecole/2', async ({ page }) => {
    await page.goto('/ecole/3')
    await page.keyboard.press('ArrowLeft')
    await expect(page).toHaveURL(/\/ecole\/2$/)
  })

  test('ArrowLeft on /ecole/1 does not navigate away (boundary guard)', async ({ page }) => {
    await page.goto('/ecole/1')
    await page.keyboard.press('ArrowLeft')
    await expect(page).toHaveURL(/\/ecole\/1$/)
  })
})

test.describe("L'Ã‰cole lesson detail â€” mobile (375Ã—667)", () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('renders /ecole/3 with audio placeholder full-width and content stacked', async ({
    page,
  }) => {
    await page.goto('/ecole/3')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByTestId('audio-player-placeholder')).toBeVisible()
    await expect(page.getByTestId('lesson-section-introduction')).toBeVisible()
  })

  test('no horizontal overflow on /ecole/3', async ({ page }) => {
    await page.goto('/ecole/3')
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const clientWidth = await page.evaluate(() => document.body.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })
})
