import { test, expect } from '@playwright/test'
import { injectAuthToken } from '../helpers/auth-e2e'

// Shared API mocks: intercept recordings + lessons so widgets resolve
// without a live BE, and inject an exam date so the countdown renders.
async function setupDashboardRoutes(page: Parameters<typeof page.route>[0]) {
  const futureDate = new Date(Date.now() + 45 * 86400000).toISOString().slice(0, 10)

  await page.route('**/api/auth/me', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 1,
        email: 'test@example.com',
        full_name: 'Test User',
        is_admin: false,
        email_verified: true,
        current_level: null,
        target_level: null,
        exam_date: futureDate,
      }),
    })
  })

  await page.route('**/api/recordings*', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    })
  })

  await page.route('**/api/ecole/lessons*', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        lessons: [
          {
            id: 1,
            lesson_number: 1,
            code: 'L001',
            title: 'Introduction',
            short_description: '',
            status: 'completed',
            quiz_attempts: 1,
            quiz_best_score: 90,
            completed_at: '2026-05-01T10:00:00Z',
            phase: 1,
            subline_en: null,
          },
          {
            id: 2,
            lesson_number: 2,
            code: 'L002',
            title: 'Le rythme de la phrase',
            short_description: '',
            status: 'unlocked',
            quiz_attempts: 0,
            quiz_best_score: null,
            completed_at: null,
            phase: 1,
            subline_en: null,
          },
        ],
      }),
    })
  })
}

test.describe('Dashboard — desktop (1280×800)', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page)
    await setupDashboardRoutes(page)
  })

  test('welcome heading and today\'s date render', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByRole('heading', { level: 1, name: /bonjour/i })).toBeVisible()
    await expect(page.getByTestId('dashboard-today')).toBeVisible()
  })

  test('all 5 widget sections are visible inside the (app) shell', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByTestId('app-shell-sidebar')).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: /compte à rebours/i })).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: /série active/i })).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: /objectif du jour/i })).toBeVisible()
    await expect(page.getByRole('heading', { level: 2, name: /prochaine leçon/i })).toBeVisible()
  })

  test('countdown widget renders days remaining > 0', async ({ page }) => {
    await page.goto('/dashboard')
    const days = page.getByTestId('countdown-days')
    await expect(days).toBeVisible()
    const text = await days.textContent()
    expect(Number(text?.trim())).toBeGreaterThan(0)
  })

  test('daily target widget shows static value of 1', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByTestId('daily-target-value')).toHaveText('1')
  })

  test('streak widget resolves (0 for empty recordings)', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByTestId('streak-count')).toBeVisible()
    await expect(page.getByTestId('streak-count')).toHaveText('0')
  })

  test('next lesson widget shows unlocked lesson and Reprendre CTA', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByTestId('next-lesson-title')).toBeVisible()
    const link = page.getByRole('link', { name: /reprendre/i })
    await expect(link).toHaveAttribute('href', '/la-methode/lecon-2')
  })

  test('calendar widget renders the month grid', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByTestId('calendar-grid')).toBeVisible()
  })

  test('widget cards carry ed-card-lift class', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByTestId('dashboard-widget-countdown')).toHaveClass(/ed-card-lift/)
    await expect(page.getByTestId('dashboard-widget-streak')).toHaveClass(/ed-card-lift/)
    await expect(page.getByTestId('dashboard-widget-daily-target')).toHaveClass(/ed-card-lift/)
    await expect(page.getByTestId('dashboard-widget-prochaine-lecon')).toHaveClass(/ed-card-lift/)
    await expect(page.getByTestId('dashboard-widget-calendar')).toHaveClass(/ed-card-lift/)
  })
})

test.describe('Dashboard — mobile (375×667)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page)
    await setupDashboardRoutes(page)
  })

  test('widgets stack vertically and remain reachable on scroll', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByRole('heading', { level: 1, name: /bonjour/i })).toBeVisible()
    for (const name of [
      /compte à rebours/i,
      /série active/i,
      /objectif du jour/i,
      /prochaine leçon/i,
    ]) {
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

  test('stacked widgets have bottom separator border in mobile view', async ({ page }) => {
    await page.goto('/dashboard')
    const countdownWidget = page.getByTestId('dashboard-widget-countdown')
    const borderBottom = await countdownWidget.evaluate(
      (el) => window.getComputedStyle(el).borderBottomWidth,
    )
    expect(parseFloat(borderBottom)).toBeGreaterThan(0)
  })
})
