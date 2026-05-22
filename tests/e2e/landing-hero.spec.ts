import { test, expect } from '@playwright/test'

test.describe('Landing hero — desktop (1280×800)', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('headline and CTA are above the fold', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Pass TCF Canada')
    await expect(page.getByRole('link', { name: /start your prep/i })).toBeVisible()
  })

  test('CTA navigates to /signup', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /start your prep/i }).click()
    // 15 s budget: first request to /signup triggers dev-server compilation
    await expect(page).toHaveURL(/\/signup/, { timeout: 15_000 })
  })

  // MOCK-001 — RotatingKicker
  test('kicker element is visible and contains an exam name', async ({ page }) => {
    await page.goto('/')
    const kicker = page.getByTestId('hero-kicker')
    await expect(kicker).toBeVisible()
    const text = await kicker.textContent()
    const EXAM_NAMES = ['TCF', 'TEF', 'DELF', 'DALF']
    expect(EXAM_NAMES.some((name) => text?.includes(name))).toBe(true)
  })

  // MOCK-001 — Sticky header scroll state
  test('header gains solid background after scrolling 80px', async ({ page }) => {
    await page.goto('/')
    const header = page.getByTestId('sticky-header')
    // At top — should not have scrolled class
    await expect(header).not.toHaveClass(/sticky-header--scrolled/)
    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 80))
    // Wait for scroll event to propagate and React to re-render
    await page.waitForTimeout(100)
    await expect(header).toHaveClass(/sticky-header--scrolled/)
  })
})

test.describe('Landing hero — mobile (375×667)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('no horizontal overflow', async ({ page }) => {
    await page.goto('/')
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const clientWidth = await page.evaluate(() => document.body.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })

  test('headline and CTA visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('link', { name: /start your prep/i })).toBeVisible()
  })

  test('CTA tap target is at least 44px tall', async ({ page }) => {
    await page.goto('/')
    const cta = page.getByRole('link', { name: /start your prep/i })
    const box = await cta.boundingBox()
    expect(box).toBeTruthy()
    expect(box!.height).toBeGreaterThanOrEqual(44)
  })

  // MOCK-001 — kicker visible on mobile
  test('kicker element is visible on mobile', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('hero-kicker')).toBeVisible()
  })
})
