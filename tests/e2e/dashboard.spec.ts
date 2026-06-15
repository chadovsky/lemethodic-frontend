import { test, expect } from '@playwright/test'
import { injectAuthToken } from '../helpers/auth-e2e'

// F-464 — three-zone /tableau-de-bord. Shared mocks: a future exam date (Examen
// card), the progress endpoint (Série + Production), and the activity calendar
// (Objectif + weekly chart + heatmap). A B1 target profile is seeded so the
// journey resolves (Niveau card + La Carte hero = education).
async function setupDashboard(page: Parameters<typeof injectAuthToken>[0]) {
  const futureDate = new Date(Date.now() + 45 * 86400000).toISOString().slice(0, 10)
  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

  await page.addInitScript(() => {
    localStorage.setItem('lm.targetProfile.v1', JSON.stringify({ level: 'B1' }))
    localStorage.setItem('lm.journeyProgress.v1', JSON.stringify({}))
  })

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
        current_level: 'b1',
        target_level: 'b1',
        exam_date: futureDate,
      }),
    })
  })

  await page.route('**/api/users/me/progress', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        current_level: 'b1',
        maitre_intensity: 1,
        streak_days: 0,
        longest_streak_days: 0,
        streak_last_active_date: null,
        production_minutes_total: 240,
        daily_target_minutes: 30,
        tache_attempts: 0,
        last_couche_signals: {},
      }),
    })
  })

  await page.route('**/api/users/me/activity-calendar*', (route) => {
    const today2 = new Date().toISOString().slice(0, 10)
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        current_streak: 3,
        longest_streak: 7,
        today_count: 30,
        today_target: 30,
        days: [
          { date: yesterday, count: 20, target_met: false },
          { date: today2, count: 30, target_met: true },
        ],
      }),
    })
  })
  void today
}

test.describe('Dashboard — desktop (1280×800)', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page)
    await setupDashboard(page)
  })

  test('greeting and the three zones render inside the shell', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByRole('heading', { level: 1, name: /bonjour/i })).toBeVisible()
    // LEFT zone = the F-465 icon rail (shell sidebar).
    await expect(page.getByTestId('app-shell-sidebar')).toBeVisible()
    // MAIN + RIGHT zones.
    await expect(page.getByTestId('dashboard-zone-main')).toBeVisible()
    await expect(page.getByTestId('dashboard-zone-rail')).toBeVisible()
  })

  test('La Carte hero links to /carte and renders the current island art (loaded)', async ({ page }) => {
    await page.goto('/dashboard')
    const cta = page.getByTestId('dashboard-carte-hero-cta')
    await expect(cta).toBeVisible()
    await expect(cta).toHaveAttribute('href', '/carte')
    const art = page.getByTestId('dashboard-carte-hero-art')
    await expect(art).toHaveAttribute('src', /island-education\.png/)
    // F-461 load guard: the PNG actually decoded (not a 404), naturalWidth > 0.
    await expect
      .poll(async () => art.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0))
      .toBe(true)
  })

  test('all six metric cards render', async ({ page }) => {
    await page.goto('/dashboard')
    for (const id of [
      'dashboard-metric-serie',
      'dashboard-metric-objectif',
      'dashboard-metric-production',
      'dashboard-metric-iles',
      'dashboard-metric-niveau',
      'dashboard-metric-examen',
    ]) {
      await expect(page.getByTestId(id)).toBeVisible()
    }
  })

  test('wired cards show real data; unwired Pièges stat is bientôt', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByTestId('dashboard-metric-niveau-value')).toHaveText('B1')
    await expect(page.getByTestId('dashboard-metric-iles-value')).toHaveText('0')
    const examVal = page.getByTestId('dashboard-metric-examen-value')
    expect(Number((await examVal.textContent())?.trim())).toBeGreaterThan(0)
    // Unwired metric: bientôt, no fabricated number.
    await expect(page.getByTestId('dashboard-stat-pieges').getByTestId('bientot-pill')).toBeVisible()
    await expect(page.getByTestId('dashboard-stat-pieges-value')).toHaveCount(0)
  })

  test('right rail renders the calendar with a coral active (target-met) day', async ({ page }) => {
    await page.goto('/dashboard')
    const calendar = page.getByTestId('dashboard-widget-calendar')
    await expect(calendar).toBeVisible()
    const todayCell = page.getByTestId('calendar-cell-today')
    await expect(todayCell).toBeVisible()
    // target_met:true -> coral outline (#E05C42 = rgb(224, 92, 66)).
    const outline = await todayCell.evaluate((el) => window.getComputedStyle(el).outlineColor)
    expect(outline).toBe('rgb(224, 92, 66)')
  })

  test('metric cards use the F-463 tint tokens (computed fill = tint, not white)', async ({ page }) => {
    await page.goto('/dashboard')
    const serie = page.getByTestId('dashboard-metric-serie')
    await expect(serie).toHaveAttribute('data-tint', 'sage')
    // --tint-sage = #CCD9CE = rgb(204, 217, 206) in light mode.
    const bg = await serie.evaluate((el) => window.getComputedStyle(el).backgroundColor)
    expect(bg).toBe('rgb(204, 217, 206)')
  })

  test('content sits within the icon-rail offset (main is pushed right of the rail)', async ({ page }) => {
    await page.goto('/dashboard')
    const main = page.locator('.app-shell-main')
    const marginLeft = await main.evaluate((el) => parseFloat(window.getComputedStyle(el).marginLeft))
    // Desktop rail pushes the content column by --lm-shell-offset (>= 64px rail).
    expect(marginLeft).toBeGreaterThanOrEqual(60)
  })
})

test.describe('Dashboard — mobile (375×667)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page)
    await setupDashboard(page)
  })

  test('zones stack into one column; rail content comes after the main zone', async ({ page }) => {
    await page.goto('/dashboard')
    const main = page.getByTestId('dashboard-zone-main')
    const rail = page.getByTestId('dashboard-zone-rail')
    await expect(main).toBeVisible()
    const mainBox = await main.boundingBox()
    const railBox = await rail.boundingBox()
    // Stacked: the rail sits below the main zone.
    expect(railBox!.y).toBeGreaterThan(mainBox!.y)
  })

  test('no horizontal overflow on /dashboard at 375px', async ({ page }) => {
    await page.goto('/dashboard')
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const clientWidth = await page.evaluate(() => document.body.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })

  test('the six metric cards remain reachable on scroll', async ({ page }) => {
    await page.goto('/dashboard')
    for (const id of ['dashboard-metric-serie', 'dashboard-metric-examen']) {
      const card = page.getByTestId(id)
      await card.scrollIntoViewIfNeeded()
      await expect(card).toBeVisible()
    }
  })
})
