import { test, expect } from '@playwright/test'

test.describe('Landing pricing — desktop (1280×800)', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('five tier cards render', async ({ page }) => {
    await page.goto('/')
    const cards = page.getByTestId('pricing-tier')
    await cards.first().scrollIntoViewIfNeeded()
    await expect(cards).toHaveCount(5)
  })

  test('Daily Bundle is highlighted as Most popular', async ({ page }) => {
    await page.goto('/')
    const badge = page.getByTestId('popular-badge')
    await badge.scrollIntoViewIfNeeded()
    await expect(badge).toBeVisible()
    await expect(badge).toHaveText('Most popular')
  })

  test('Daily Bundle CTA navigates to /signup?tier=daily-bundle', async ({ page }) => {
    await page.goto('/')
    const dailyCard = page.getByTestId('pricing-tier').filter({ hasText: 'Daily Bundle' })
    const cta = dailyCard.getByTestId('tier-cta')
    await cta.scrollIntoViewIfNeeded()
    await cta.click()
    await expect(page).toHaveURL(/\/signup\?tier=daily-bundle/, { timeout: 15_000 })
  })
})

test.describe('Landing pricing — mobile (375×667)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('no horizontal overflow', async ({ page }) => {
    await page.goto('/')
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const clientWidth = await page.evaluate(() => document.body.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })

  test('all five tier cards visible on scroll', async ({ page }) => {
    await page.goto('/')
    const cards = page.getByTestId('pricing-tier')
    await expect(cards).toHaveCount(5)
    for (let i = 0; i < 5; i++) {
      await cards.nth(i).scrollIntoViewIfNeeded()
      await expect(cards.nth(i)).toBeVisible()
    }
  })
})
