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
