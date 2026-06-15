// F-458 — L'Île page: the 3-beat template (FE).
// Receipts:
//   f-458-ile-education-1440.png   / -375.png        (light)
//   f-458-ile-education-dark-1440.png                (dark)
// Trace: tests/traces/f-458.zip (desktop happy path).
//
// Covers: the carte's current-ile CTA now lands on the real 3-beat ile page
// (not the old bientot stub, no 404); header carries theme/level/status; the
// three beats render; Beat 1 lists vocab + grammar points with the Pieges
// Anglais marker on interference points; Beat 2 lists the 5 activity shells +
// the placed-but-gated seance CTA; Beat 3 is the bientot mini-mock.

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

async function authDark(page: Page) {
  await injectAuthToken(page)
  await page.addInitScript(() => localStorage.setItem('theme', 'dark'))
}

test.describe("F-458 — L'Île (desktop 1440, light)", () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page)
  })

  test('the carte CTA lands the real 3-beat ile page', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    ensureDir(TRACE_DIR)
    await page.context().tracing.start({ screenshots: true, snapshots: true })

    // Enter from the carte's current-ile CTA, proving the nav wire end-to-end.
    await page.goto('/carte')
    await page.getByTestId('carte-current-cta').click()
    await expect(page).toHaveURL(/\/ile\/education$/)

    // Header: theme label + level + status.
    await expect(page.getByTestId('ile-page')).toBeVisible()
    const header = page.getByTestId('ile-header')
    await expect(header).toHaveAttribute('data-theme', 'education')
    await expect(header).toHaveAttribute('data-level', 'B1')
    await expect(header).toHaveAttribute('data-status', 'current')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText("L'éducation")

    // The three beats.
    await expect(page.getByTestId('ile-beat-learn')).toBeVisible()
    await expect(page.getByTestId('ile-beat-practice')).toBeVisible()
    await expect(page.getByTestId('ile-beat-check')).toBeVisible()

    // Beat 1: vocab + grammar points + Pieges Anglais markers.
    await expect(page.getByTestId('ile-vocab-item')).toHaveCount(5)
    await expect(page.getByTestId('ile-grammar-point')).toHaveCount(2)
    await expect(page.getByTestId('ile-piege')).toHaveCount(2)

    // Beat 2: 5 activity shells + the launch CTA. F-460 un-gated it on the
    // current ile: it is now a live link into the seance walk.
    await expect(page.getByTestId('ile-activity')).toHaveCount(5)
    const seance = page.getByTestId('ile-seance-cta')
    await expect(seance).toBeVisible()
    await expect(seance).toHaveAttribute('href', '/seance?ile=education')

    // Beat 3: the bientot mini-mock.
    await expect(page.getByTestId('ile-mini-mock')).toHaveAttribute('data-status', 'bientot')

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'f-458-ile-education-1440.png'),
      fullPage: true,
    })

    await page.context().tracing.stop({ path: path.join(TRACE_DIR, 'f-458.zip') })
  })

  test('an unknown theme lands the graceful bientot stub, not a 404', async ({ page }) => {
    await page.goto('/ile/not-a-theme')
    await expect(page).toHaveURL(/\/ile\/not-a-theme$/)
    await expect(page.getByTestId('ile-not-found')).toBeVisible()
  })
})

test.describe("F-458 — L'Île (desktop 1440, dark)", () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test.beforeEach(async ({ page }) => {
    await authDark(page)
  })

  test('renders the 3-beat page in dark mode', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto('/ile/education')
    await expect(page.locator('html')).toHaveClass(/dark/)
    await expect(page.getByTestId('ile-page')).toBeVisible()
    await expect(page.getByTestId('ile-beat-learn')).toBeVisible()
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'f-458-ile-education-dark-1440.png'),
      fullPage: true,
    })
  })
})

test.describe("F-458 — L'Île (mobile 375, light)", () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page)
  })

  test('renders the 3-beat page on mobile', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto('/ile/education')
    await expect(page.getByTestId('ile-page')).toBeVisible()
    await expect(page.getByTestId('ile-beat-practice')).toBeVisible()
    await expect(page.getByTestId('ile-seance-cta')).toHaveAttribute('href', '/seance?ile=education')
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'f-458-ile-education-375.png'),
      fullPage: true,
    })
  })
})
