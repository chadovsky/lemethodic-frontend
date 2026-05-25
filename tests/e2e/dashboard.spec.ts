import { test, expect } from '@playwright/test'
import { injectAuthToken } from '../helpers/auth-e2e'

test.beforeEach(async ({ page }) => {
  await injectAuthToken(page)
})

test.describe('Dashboard — desktop (1280×800)', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('welcome heading and today\'s date render', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByRole('heading', { level: 1, name: /bonjour/i })).toBeVisible()
    await expect(page.getByTestId('dashboard-today')).toBeVisible()
  })

  test('all 4 widget cards are visible inside the (app) shell', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByTestId('app-shell-sidebar')).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: /progression/i })).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: /activité récente/i })).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: /prochaine leçon/i })).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: /score diagnostic/i })).toBeVisible()
  })

  test('Progression widget shows 5 layers in the locked order', async ({ page }) => {
    await page.goto('/dashboard')
    const layers = page.getByTestId('progress-layer')
    await expect(layers).toHaveCount(5)
    await expect(layers.nth(0)).toContainText('Le Propos')
    await expect(layers.nth(1)).toContainText('Le Plan')
    await expect(layers.nth(2)).toContainText('La Construction')
    await expect(layers.nth(3)).toContainText('Les Pièges Anglais')
    await expect(layers.nth(4)).toContainText('La Musique')
  })

  test('"Prochaine leçon" CTA navigates to /ecole/5', async ({ page }) => {
    await page.goto('/dashboard')
    await page.getByRole('link', { name: /reprendre/i }).click()
    await expect(page).toHaveURL(/\/ecole\/5$/)
  })

  test('"Score Diagnostic" CTA links to /diagnostic', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByRole('link', { name: /voir le détail/i })).toHaveAttribute(
      'href',
      '/diagnostic',
    )
  })

  // MOCK-007 — bar widths animate and settle > 0
  test('ProgressWidget bar widths settle to target after 700ms', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForTimeout(700)
    const fondWidth = await page.getByTestId('progress-bar-le-fond').evaluate(
      (el: HTMLElement) => parseFloat(el.style.width),
    )
    expect(fondWidth).toBeGreaterThan(0)
  })

  // MOCK-007 — widget cards have ed-card-lift hover class
  test('widget cards carry ed-card-lift class', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByTestId('dashboard-widget-progression')).toHaveClass(/ed-card-lift/)
    await expect(page.getByTestId('dashboard-widget-activite')).toHaveClass(/ed-card-lift/)
    await expect(page.getByTestId('dashboard-widget-prochaine-lecon')).toHaveClass(/ed-card-lift/)
    await expect(page.getByTestId('dashboard-widget-score')).toHaveClass(/ed-card-lift/)
  })

  // MOCK-007 — RecentActivityWidget shows 5 rows
  test('RecentActivityWidget shows exactly 5 activity rows', async ({ page }) => {
    await page.goto('/dashboard')
    const dots = page.getByTestId('activity-dot')
    await expect(dots).toHaveCount(5)
  })
})

test.describe('Dashboard — mobile (375×667)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('widgets stack vertically and remain reachable on scroll', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByRole('heading', { level: 1, name: /bonjour/i })).toBeVisible()
    for (const name of [/progression/i, /activité récente/i, /prochaine leçon/i, /score diagnostic/i]) {
      const heading = page.getByRole('heading', { level: 2, name })
      await heading.scrollIntoViewIfNeeded()
      await expect(heading).toBeVisible()
    }
  })

  test('no horizontal overflow on /dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const clientWidth = await page.evaluate(() => document.body.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })

  // MOCK-007 — mobile widgets have bottom separator
  test('stacked widgets have bottom separator border in mobile view', async ({ page }) => {
    await page.goto('/dashboard')
    const progressWidget = page.getByTestId('dashboard-widget-progression')
    const borderBottom = await progressWidget.evaluate(
      (el) => window.getComputedStyle(el).borderBottomWidth,
    )
    expect(parseFloat(borderBottom)).toBeGreaterThan(0)
  })
})
