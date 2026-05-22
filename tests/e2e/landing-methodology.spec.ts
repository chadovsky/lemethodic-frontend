import { test, expect } from '@playwright/test'

const LAYER_NAMES = [
  'Le Fond',
  'Les Moules des Idées',
  'Les Moules',
  'Les Réflexes Anglais',
  'La Voix',
]

test.describe('Landing methodology — desktop (1280×800)', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('section heading is present', async ({ page }) => {
    await page.goto('/')
    const heading = page.getByRole('heading', { level: 2, name: /5-couche method/i })
    await heading.scrollIntoViewIfNeeded()
    await expect(heading).toBeVisible()
  })

  test('five layers render in correct order', async ({ page }) => {
    await page.goto('/')
    const names = page.getByTestId('couche-name')
    await expect(names).toHaveCount(5)
    for (let i = 0; i < LAYER_NAMES.length; i++) {
      await expect(names.nth(i)).toHaveText(LAYER_NAMES[i])
    }
  })

  // MOCK-003 — left-border accent: each layer has a 3px+ left border
  test('each layer has a left-border accent (≥3px)', async ({ page }) => {
    await page.goto('/')
    const layers = page.getByTestId('couche-layer')
    await expect(layers).toHaveCount(5)
    for (let i = 0; i < 5; i++) {
      const layer = layers.nth(i)
      await layer.scrollIntoViewIfNeeded()
      const borderLeftWidth = await layer.evaluate((el) =>
        parseFloat(window.getComputedStyle(el).borderLeftWidth)
      )
      expect(borderLeftWidth).toBeGreaterThanOrEqual(3)
    }
  })

  // MOCK-003 — ed-card-lift: computed transform is negative Y on hover
  // Skipped on mobile project: @media (hover: hover) doesn't match touch devices.
  test('layer gains translateY(-2px) on hover (ed-card-lift)', async ({ page, isMobile }) => {
    test.skip(isMobile, '@media (hover: hover) does not apply on touch devices')
    await page.goto('/')
    const layer = page.getByTestId('couche-layer').first()
    await layer.scrollIntoViewIfNeeded()
    // Allow framer-motion whileInView animation to settle (700ms + buffer)
    await page.waitForTimeout(1000)
    await layer.hover()
    await page.waitForTimeout(300)
    const transform = await layer.evaluate((el) =>
      window.getComputedStyle(el).transform
    )
    // translateY(-2px) computes to matrix(1, 0, 0, 1, 0, -2); 6th value is Y
    const ty = parseFloat(transform.split(',')[5])
    expect(ty).toBeLessThan(0)
  })

  // MOCK-003 — reduced-motion: CSS override ensures no hover lift
  test('no hover lift under reduced-motion', async ({ page, isMobile }) => {
    test.skip(isMobile, '@media (hover: hover) does not apply on touch devices')
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    const layer = page.getByTestId('couche-layer').first()
    await layer.scrollIntoViewIfNeeded()
    await page.waitForTimeout(300)
    await layer.hover()
    await page.waitForTimeout(300)
    const transform = await layer.evaluate((el) =>
      window.getComputedStyle(el).transform
    )
    // @media (prefers-reduced-motion: reduce) { .ed-card-lift:hover { transform: none } }
    expect(transform === 'none' || transform === 'matrix(1, 0, 0, 1, 0, 0)').toBe(true)
  })

  test('CTA navigates to /method', async ({ page }) => {
    await page.goto('/')
    const cta = page.getByRole('link', { name: /see how it works/i })
    await cta.scrollIntoViewIfNeeded()
    await cta.click()
    await expect(page).toHaveURL(/\/method/, { timeout: 15_000 })
  })
})

test.describe('Landing methodology — mobile (375×667)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('no horizontal overflow', async ({ page }) => {
    await page.goto('/')
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const clientWidth = await page.evaluate(() => document.body.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })

  test('all five layer names visible on scroll', async ({ page }) => {
    await page.goto('/')
    for (let i = 0; i < LAYER_NAMES.length; i++) {
      const el = page.getByTestId('couche-name').nth(i)
      await el.scrollIntoViewIfNeeded()
      await expect(el).toBeVisible()
      await expect(el).toHaveText(LAYER_NAMES[i])
    }
  })
})
