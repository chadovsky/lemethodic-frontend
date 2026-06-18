import { test, expect } from '@playwright/test'

// F-478 — the 5-tier USD teaser is retired. The homepage pricing section is now a
// minimal no-price hook: a value line + a single "View pricing" CTA → /tarifs.

const PRICE_RE = /\$\s?\d|\d\s?€|€\s?\d/

test.describe('Landing pricing hook — desktop (1440×900)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('renders the no-price hook with a single View pricing CTA', async ({ page }) => {
    await page.goto('/')
    const cta = page.getByTestId('pricing-cta')
    await cta.scrollIntoViewIfNeeded()
    await expect(cta).toBeVisible()
    await expect(cta).toHaveText('View pricing')
    await expect(cta).toHaveAttribute('href', '/tarifs')
    // F-225 receipt (gitignored): desktop pricing section.
    await page.screenshot({ path: 'tests/screenshots/f-478-landing-1440.png', fullPage: true })
  })

  test('the pricing section shows no prices and no retired tier cards', async ({ page }) => {
    await page.goto('/')
    const section = page.getByRole('region', { name: /pricing/i })
    await section.scrollIntoViewIfNeeded()
    await expect(section).toBeVisible()
    const text = (await section.textContent()) ?? ''
    expect(text).not.toMatch(PRICE_RE)
    await expect(page.getByTestId('pricing-tier')).toHaveCount(0)
    await expect(page.getByTestId('pricing-badge-popular')).toHaveCount(0)
  })

  test('View pricing CTA navigates to /tarifs', async ({ page }) => {
    await page.goto('/')
    const cta = page.getByTestId('pricing-cta')
    await cta.scrollIntoViewIfNeeded()
    await cta.click()
    await expect(page).toHaveURL(/\/tarifs$/, { timeout: 15_000 })
  })

  test('footer social links are present', async ({ page }) => {
    await page.goto('/')
    const gh = page.getByTestId('footer-social-github')
    const tw = page.getByTestId('footer-social-twitter')
    await gh.scrollIntoViewIfNeeded()
    await expect(gh).toBeVisible()
    await expect(tw).toBeVisible()
  })
})

test.describe('Landing pricing hook — mobile (375×667)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('no horizontal overflow', async ({ page }) => {
    await page.goto('/')
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const clientWidth = await page.evaluate(() => document.body.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })

  test('hook + CTA visible on scroll, no prices', async ({ page }) => {
    await page.goto('/')
    const cta = page.getByTestId('pricing-cta')
    await cta.scrollIntoViewIfNeeded()
    await expect(cta).toBeVisible()
    const section = page.getByRole('region', { name: /pricing/i })
    const text = (await section.textContent()) ?? ''
    expect(text).not.toMatch(PRICE_RE)
    // F-225 receipt (gitignored): mobile pricing section.
    await page.screenshot({ path: 'tests/screenshots/f-478-landing-375.png', fullPage: true })
  })
})
