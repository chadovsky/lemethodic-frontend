import { test, expect } from '@playwright/test'

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
    await expect(layers.nth(0)).toContainText('Le Fond')
    await expect(layers.nth(1)).toContainText('Les Moules des Idées')
    await expect(layers.nth(2)).toContainText('Les Moules')
    await expect(layers.nth(3)).toContainText('Les Réflexes Anglais')
    await expect(layers.nth(4)).toContainText('La Voix')
  })

  test('"Prochaine leçon" CTA navigates to /ecole/5', async ({ page }) => {
    await page.goto('/dashboard')
    await page.getByRole('link', { name: /reprendre/i }).click()
    await expect(page).toHaveURL(/\/ecole\/5$/)
  })

  test('"Score Diagnostic" CTA links to /diagnostic', async ({ page }) => {
    await page.goto('/dashboard')
    // /diagnostic is wrapped in ProtectedRoute which redirects unauth-ed
    // visitors to /. Asserting the href documents the intended destination
    // without depending on auth state (BE-001 will wire the gate properly).
    await expect(page.getByRole('link', { name: /voir le détail/i })).toHaveAttribute(
      'href',
      '/diagnostic',
    )
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
})
