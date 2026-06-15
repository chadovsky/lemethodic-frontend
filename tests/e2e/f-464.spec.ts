// F-464 — three-zone /tableau-de-bord dashboard rebuild (FE).
// F-225 receipts:
//   f-464-tableau-de-bord-1440.png / -375.png       (light)
//   f-464-tableau-de-bord-dark-1440.png             (dark — tints fall back to
//                                                    the dark card surface, F-463)
// Trace: tests/traces/f-464.zip (desktop happy path: hero CTA -> /carte).
//
// Covers the locked layout: LEFT zone = the F-465 icon rail (shell sidebar),
// MAIN zone = greeting + La Carte hero (3x2) + six tinted metric cards, RIGHT
// rail = calendar + weekly chart + two stat cards. Wired metrics show real data
// (streak / niveau / îles / objectif / production); the unwired Pièges stat is
// bientôt (no fabricated number). The hero island art is load-guarded (F-461).

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

async function setup(page: Page, opts: { dark?: boolean } = {}) {
  const futureDate = new Date(Date.now() + 45 * 86400000).toISOString().slice(0, 10)
  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

  await injectAuthToken(page)
  await page.addInitScript(
    (args) => {
      if (args.dark) localStorage.setItem('theme', 'dark')
      localStorage.setItem('lm.targetProfile.v1', JSON.stringify({ level: 'B1' }))
      localStorage.setItem('lm.journeyProgress.v1', JSON.stringify({}))
    },
    { dark: Boolean(opts.dark) },
  )

  await page.route('**/api/auth/me', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 1,
        email: 'chadi@lemethodic.com',
        full_name: 'Chadi Bakhay',
        email_verified: true,
        current_level: 'b1',
        target_level: 'b1',
        exam_date: futureDate,
      }),
    }),
  )
  await page.route('**/api/users/me/progress', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        current_level: 'b1',
        maitre_intensity: 1,
        streak_days: 4,
        longest_streak_days: 9,
        streak_last_active_date: today,
        production_minutes_total: 240,
        daily_target_minutes: 30,
        tache_attempts: 2,
        last_couche_signals: {},
      }),
    }),
  )
  await page.route('**/api/users/me/activity-calendar*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        current_streak: 4,
        longest_streak: 9,
        today_count: 30,
        today_target: 30,
        days: [
          { date: yesterday, count: 18, target_met: false },
          { date: today, count: 30, target_met: true },
        ],
      }),
    }),
  )
}

test.describe('F-464 — dashboard (desktop 1440, light)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test.beforeEach(async ({ page }) => {
    await setup(page)
  })

  test('three zones, wired metrics, hero art, calendar; hero CTA lands /carte', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    ensureDir(TRACE_DIR)
    await page.context().tracing.start({ screenshots: true, snapshots: true })

    await page.goto('/tableau-de-bord')

    // Three zones (left = the shell icon rail).
    await expect(page.getByTestId('app-shell-sidebar')).toBeVisible()
    await expect(page.getByTestId('dashboard-zone-main')).toBeVisible()
    await expect(page.getByTestId('dashboard-zone-rail')).toBeVisible()

    // La Carte hero — current island art is actually served (F-461 guard).
    const art = page.getByTestId('dashboard-carte-hero-art')
    await expect(art).toHaveAttribute('src', /island-education\.png/)
    await expect
      .poll(() => art.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0))
      .toBe(true)

    // Six metric cards; wired ones show real data.
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
    await expect(page.getByTestId('dashboard-metric-serie-value')).toHaveText('4')
    await expect(page.getByTestId('dashboard-metric-niveau-value')).toHaveText('B1')

    // Tint token applied, not a literal: sage = rgb(204, 217, 206).
    const bg = await page
      .getByTestId('dashboard-metric-serie')
      .evaluate((el) => window.getComputedStyle(el).backgroundColor)
    expect(bg).toBe('rgb(204, 217, 206)')

    // Right rail: calendar with a coral active day + the weekly chart.
    await expect(page.getByTestId('dashboard-widget-calendar')).toBeVisible()
    await expect(page.getByTestId('dashboard-weekly-chart')).toBeVisible()
    const outline = await page
      .getByTestId('calendar-cell-today')
      .evaluate((el) => window.getComputedStyle(el).outlineColor)
    expect(outline).toBe('rgb(224, 92, 66)') // --accent #E05C42

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-464-tableau-de-bord-1440.png'), fullPage: true })

    // Happy path: the hero CTA lands La Carte.
    await page.getByTestId('dashboard-carte-hero-cta').click()
    await expect(page).toHaveURL(/\/carte$/)
    await expect(page.getByTestId('carte-journey')).toBeVisible()

    await page.context().tracing.stop({ path: path.join(TRACE_DIR, 'f-464.zip') })
  })
})

test.describe('F-464 — dashboard (desktop 1440, dark)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test.beforeEach(async ({ page }) => {
    await setup(page, { dark: true })
  })

  test('renders in dark mode (tints fall back to the dark card surface)', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto('/tableau-de-bord')
    await expect(page.locator('html')).toHaveClass(/dark/)
    await expect(page.getByTestId('dashboard-zone-main')).toBeVisible()
    await expect(page.getByTestId('dashboard-metric-serie')).toBeVisible()
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-464-tableau-de-bord-dark-1440.png'), fullPage: true })
  })
})

test.describe('F-464 — dashboard (mobile 375, light)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test.beforeEach(async ({ page }) => {
    await setup(page)
  })

  test('single-column reflow, rail after main, zero horizontal overflow', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto('/tableau-de-bord')

    const main = page.getByTestId('dashboard-zone-main')
    const rail = page.getByTestId('dashboard-zone-rail')
    await expect(main).toBeVisible()
    const mainBox = await main.boundingBox()
    const railBox = await rail.boundingBox()
    expect(railBox!.y).toBeGreaterThan(mainBox!.y) // stacked: rail below main

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-464-tableau-de-bord-375.png'), fullPage: true })
  })
})
