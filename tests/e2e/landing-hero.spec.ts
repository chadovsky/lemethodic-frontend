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
    await expect(page).toHaveURL(/\/signup/)
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
})
