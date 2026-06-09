import { test, expect } from '@playwright/test'
import { injectAuthToken } from '../helpers/auth-e2e'
import path from 'path'

// F-444 — CalendarWidget + today-vs-target bar (activity-calendar endpoint)
//
// Covers: heatmap render, streak display, today progress bar,
//         error graceful state, zero-activity new-user case.
// Screenshots: 1440px desktop + 375px mobile per F-225 protocol.

const SCREENSHOTS = path.resolve(__dirname, '../screenshots')
const TRACES = path.resolve(__dirname, '../traces')

function buildActivityCalendarBody(opts: {
  currentStreak: number
  longestStreak: number
  todayCount: number
  todayTarget: number
  hasDays: boolean
}) {
  const today = new Date().toISOString().slice(0, 10)
  const days = opts.hasDays
    ? Array.from({ length: 90 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (89 - i))
        return {
          date: d.toISOString().slice(0, 10),
          count: i === 89 ? opts.todayCount : i % 4,
          target_met: i % 7 === 0,
        }
      })
    : [{ date: today, count: opts.todayCount, target_met: false }]
  return JSON.stringify({
    current_streak: opts.currentStreak,
    longest_streak: opts.longestStreak,
    today_count: opts.todayCount,
    today_target: opts.todayTarget,
    days,
  })
}

async function setupBaseRoutes(page: Parameters<typeof page.route>[0]) {
  const futureDate = new Date(Date.now() + 45 * 86400000).toISOString().slice(0, 10)

  await page.route('**/api/auth/me', (route) =>
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
    }),
  )

  await page.route('**/api/recordings*', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
  )

  await page.route('**/api/ecole/lessons*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ lessons: [] }),
    }),
  )

  await page.route('**/api/users/me/progress', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        current_level: 'b1',
        maitre_intensity: 1,
        streak_days: 5,
        longest_streak_days: 14,
        streak_last_active_date: null,
        production_minutes_total: 0,
        daily_target_minutes: 30,
        tache_attempts: 0,
        last_couche_signals: {},
      }),
    }),
  )
}

// ── Desktop ──────────────────────────────────────────────────────────────────

test.describe('F-444 CalendarWidget — desktop (1440×900)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page)
    await setupBaseRoutes(page)
  })

  test('calendar widget renders heatmap grid with streak and today bar', async ({ page }) => {
    await page.route('**/api/users/me/activity-calendar*', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: buildActivityCalendarBody({
          currentStreak: 4,
          longestStreak: 12,
          todayCount: 20,
          todayTarget: 30,
          hasDays: true,
        }),
      }),
    )
    await page.goto('/dashboard')

    // F-440 widgets still present (smoke check per dispatch acceptance)
    await expect(page.getByTestId('dashboard-widget-streak')).toBeVisible()
    await expect(page.getByTestId('dashboard-widget-daily-target')).toBeVisible()

    // F-444 widgets
    await expect(page.getByTestId('dashboard-widget-calendar')).toBeVisible()
    await expect(page.getByTestId('calendar-grid')).toBeVisible()
    await expect(page.getByTestId('calendar-current-streak')).toHaveText('4')
    await expect(page.getByTestId('calendar-longest-streak')).toHaveText('12')
    await expect(page.getByTestId('calendar-today-count')).toHaveText('20 / 30 min')
    await expect(page.getByTestId('calendar-today-bar')).toBeVisible()

    // Today cell is marked
    await expect(page.getByTestId('calendar-cell-today')).toBeVisible()
  })

  test('calendar shows zero-activity state cleanly (new user)', async ({ page }) => {
    await page.route('**/api/users/me/activity-calendar*', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: buildActivityCalendarBody({
          currentStreak: 0,
          longestStreak: 0,
          todayCount: 0,
          todayTarget: 30,
          hasDays: true,
        }),
      }),
    )
    await page.goto('/dashboard')
    await expect(page.getByTestId('calendar-current-streak')).toHaveText('0')
    await expect(page.getByTestId('calendar-grid')).toBeVisible()
  })

  test('calendar shows graceful error state when endpoint fails', async ({ page }) => {
    await page.route('**/api/users/me/activity-calendar*', (route) =>
      route.fulfill({ status: 500, contentType: 'application/json', body: '{}' }),
    )
    await page.goto('/dashboard')
    await expect(page.getByTestId('calendar-error')).toBeVisible()
    // F-440 widgets still render independently
    await expect(page.getByTestId('dashboard-widget-streak')).toBeVisible()
  })

  test('F-444 desktop screenshot 1440px', async ({ page }) => {
    await page.route('**/api/users/me/activity-calendar*', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: buildActivityCalendarBody({
          currentStreak: 4,
          longestStreak: 12,
          todayCount: 20,
          todayTarget: 30,
          hasDays: true,
        }),
      }),
    )
    await page.goto('/dashboard')
    await page.getByTestId('calendar-grid').waitFor({ state: 'visible' })
    await page.screenshot({
      path: `${SCREENSHOTS}/f-444-dashboard-1440.png`,
      fullPage: true,
    })
  })
})

// ── Mobile ───────────────────────────────────────────────────────────────────

test.describe('F-444 CalendarWidget — mobile (375×667)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page)
    await setupBaseRoutes(page)
    await page.route('**/api/users/me/activity-calendar*', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: buildActivityCalendarBody({
          currentStreak: 4,
          longestStreak: 12,
          todayCount: 20,
          todayTarget: 30,
          hasDays: true,
        }),
      }),
    )
  })

  test('calendar widget is reachable on mobile scroll', async ({ page }) => {
    await page.goto('/dashboard')
    const widget = page.getByTestId('dashboard-widget-calendar')
    await widget.scrollIntoViewIfNeeded()
    await expect(widget).toBeVisible()
    await expect(page.getByTestId('calendar-grid')).toBeVisible()
  })

  test('no horizontal overflow on /dashboard with CalendarWidget', async ({ page }) => {
    await page.goto('/dashboard')
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const clientWidth = await page.evaluate(() => document.body.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })

  test('F-444 mobile screenshot 375px', async ({ page }) => {
    await page.goto('/dashboard')
    const widget = page.getByTestId('dashboard-widget-calendar')
    await widget.scrollIntoViewIfNeeded()
    await page.getByTestId('calendar-grid').waitFor({ state: 'visible' })
    await page.screenshot({
      path: `${SCREENSHOTS}/f-444-dashboard-375.png`,
      fullPage: true,
    })
  })
})
