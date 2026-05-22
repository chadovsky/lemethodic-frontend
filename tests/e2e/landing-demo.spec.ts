import { test, expect } from '@playwright/test'

test.describe('Landing demo — desktop (1280×800)', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('demo section heading is visible after scroll', async ({ page }) => {
    await page.goto('/')
    const section = page.getByTestId('demo-section')
    await section.scrollIntoViewIfNeeded()
    await expect(section.getByRole('heading', { level: 2 })).toBeVisible()
  })

  test('primary recording surface is visible', async ({ page }) => {
    await page.goto('/')
    const primary = page.getByTestId('demo-image-primary')
    await primary.scrollIntoViewIfNeeded()
    await expect(primary).toBeVisible()
  })

  test('secondary score card is visible on desktop', async ({ page }) => {
    await page.goto('/')
    const secondary = page.getByTestId('demo-image-secondary')
    await secondary.scrollIntoViewIfNeeded()
    await expect(secondary).toBeVisible()
  })

  // MOCK-002 — reveal-on-scroll: after scrolling into view and waiting for
  // the 700ms animation, the demo block should be at translateY(0)
  test('demo block animates to translateY(0) after scroll entry', async ({ page }) => {
    await page.goto('/')
    const primary = page.getByTestId('demo-image-primary')
    await primary.scrollIntoViewIfNeeded()
    await page.waitForTimeout(900)
    const transform = await primary.evaluate((el) =>
      window.getComputedStyle(el).transform
    )
    // After animation completes: matrix should have ty ≈ 0 (no negative Y)
    if (transform !== 'none') {
      const ty = parseFloat(transform.split(',')[5])
      expect(Math.abs(ty)).toBeLessThan(2)
    }
  })
})

test.describe('Landing demo — mobile (375×667)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('no horizontal overflow', async ({ page }) => {
    await page.goto('/')
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const clientWidth = await page.evaluate(() => document.body.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })

  test('primary recording surface is visible on mobile scroll', async ({ page }) => {
    await page.goto('/')
    const primary = page.getByTestId('demo-image-primary')
    await primary.scrollIntoViewIfNeeded()
    await expect(primary).toBeVisible()
  })

  test('secondary score card is hidden on mobile', async ({ page }) => {
    await page.goto('/')
    const secondary = page.getByTestId('demo-image-secondary')
    await expect(secondary).toBeHidden()
  })
})
