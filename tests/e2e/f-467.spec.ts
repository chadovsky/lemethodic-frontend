// F-467 — daily-target editor in /parametres (FE-only).
// F-225 receipts:
//   f-467-parametres-objectif.png        (light, 1440)
//   f-467-parametres-objectif-dark.png   (dark, 1440)
//   f-467-parametres-objectif-375.png    (mobile, 375)
// Trace: tests/traces/f-467.zip (change target -> PATCH fires -> reload persists
//        -> dashboard "Objectif du jour" card reflects the new value).
//
// One source of truth: /parametres writes daily_target_minutes via PATCH
// /api/users/me/progress; the dashboard "Objectif du jour" card reads
// activity-calendar.todayTarget, which the BE derives from the same field. The
// stateful mock below mirrors that: the PATCH mutates a server-side `target` and
// the activity-calendar mock returns it as today_target.

import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { injectAuthToken } from '../helpers/auth-e2e'
import * as path from 'path'
import * as fs from 'fs'

const SCREENSHOT_DIR = path.join(__dirname, '../screenshots')
const TRACE_DIR = path.join(__dirname, '../traces')

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

// Stateful backend: progress + activity-calendar share one `target` that PATCH
// mutates, so the dashboard card reflects what /parametres saved.
async function setup(page: Page, opts: { dark?: boolean } = {}) {
  const today = new Date().toISOString().slice(0, 10)

  await injectAuthToken(page)
  if (opts.dark) {
    await page.addInitScript(() => localStorage.setItem('theme', 'dark'))
  }

  let target = 30

  await page.route('**/api/users/me/progress', (route) => {
    const req = route.request()
    if (req.method() === 'PATCH') {
      const body = JSON.parse(req.postData() || '{}') as { daily_target_minutes?: number }
      if (typeof body.daily_target_minutes === 'number') target = body.daily_target_minutes
    }
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        current_level: 'b1',
        maitre_intensity: 1,
        streak_days: 0,
        longest_streak_days: 0,
        streak_last_active_date: null,
        production_minutes_total: 0,
        daily_target_minutes: target,
        tache_attempts: 0,
        last_couche_signals: {},
      }),
    })
  })

  await page.route('**/api/users/me/activity-calendar*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        current_streak: 0,
        longest_streak: 0,
        today_count: 0,
        today_target: target,
        days: [{ date: today, count: 0, target_met: false }],
      }),
    }),
  )
}

test.describe('F-467 — daily-target editor (desktop 1440, light)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test.beforeEach(async ({ page }) => {
    await setup(page)
  })

  test('change target -> PATCH -> reload persists -> dashboard card reflects it', async ({
    page,
  }) => {
    ensureDir(SCREENSHOT_DIR)
    ensureDir(TRACE_DIR)
    await page.context().tracing.start({ screenshots: true, snapshots: true })

    await page.goto('/parametres')

    const section = page.getByTestId('parametres-objectif')
    await expect(section).toBeVisible()
    await expect(page.getByTestId('daily-target-value')).toHaveText('30')

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'f-467-parametres-objectif.png'),
      fullPage: true,
    })

    // Edit -> 45 -> save. PATCH must fire with the new value.
    const patch = page.waitForRequest(
      (r) => r.url().includes('/api/users/me/progress') && r.method() === 'PATCH',
    )
    await page.getByTestId('daily-target-edit-btn').click()
    await page.getByTestId('daily-target-input').fill('45')
    await page.getByTestId('daily-target-save-btn').click()
    const patchReq = await patch
    expect(JSON.parse(patchReq.postData() || '{}')).toMatchObject({ daily_target_minutes: 45 })

    await expect(page.getByTestId('daily-target-value')).toHaveText('45')

    // Reload persists (server-side mock now holds 45).
    await page.reload()
    await expect(page.getByTestId('daily-target-value')).toHaveText('45')

    // Single source of truth: the dashboard "Objectif du jour" card reads
    // today_target (shown in its unit string), now 45.
    await page.goto('/tableau-de-bord')
    await expect(page.getByTestId('dashboard-metric-objectif')).toContainText('/ 45 min')

    await page.context().tracing.stop({ path: path.join(TRACE_DIR, 'f-467.zip') })
  })
})

test.describe('F-467 — daily-target editor (desktop 1440, dark)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test.beforeEach(async ({ page }) => {
    await setup(page, { dark: true })
  })

  test('renders in dark mode', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto('/parametres')
    await expect(page.locator('html')).toHaveClass(/dark/)
    await expect(page.getByTestId('parametres-objectif')).toBeVisible()
    await expect(page.getByTestId('daily-target-value')).toHaveText('30')
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'f-467-parametres-objectif-dark.png'),
      fullPage: true,
    })
  })
})

test.describe('F-467 — daily-target editor (mobile 375, light)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test.beforeEach(async ({ page }) => {
    await setup(page)
  })

  test('single-column, no horizontal overflow', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto('/parametres')
    await expect(page.getByTestId('parametres-objectif')).toBeVisible()
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'f-467-parametres-objectif-375.png'),
      fullPage: true,
    })
  })
})
