// F-460 — La Seance: the linear Practice walk (FE).
// Receipts:
//   f-460-seance-1440.png          / -375.png         (light, the walk)
//   f-460-seance-complete-1440.png                    (completion screen)
//   f-460-seance-dark-1440.png                        (dark)
// Trace: tests/traces/f-460.zip (desktop happy path).
//
// Covers: the ile-page "Commencer la seance" CTA (F-458, un-gated here) lands
// the seance walk; the stepper walks the 5 Practice activities (1..5 sur 5) with
// previous/next; the completion screen returns to the carte; finishing marks the
// ile completed (localStorage) so the carte advances current to the next ile.

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

test.describe('F-460 — La Seance (desktop 1440, light)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page)
  })

  test('un-gated ile CTA -> walk the 5 activities -> completion -> carte advances', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    ensureDir(TRACE_DIR)
    await page.context().tracing.start({ screenshots: true, snapshots: true })

    // Enter from the ile page's now-live seance CTA.
    await page.goto('/ile/education')
    await page.getByTestId('ile-seance-cta').click()
    await expect(page).toHaveURL(/\/seance\?ile=education$/)

    // Stepper: header + first step.
    const header = page.getByTestId('seance-header')
    await expect(header).toHaveAttribute('data-theme', 'education')
    await expect(header).toHaveAttribute('data-level', 'B1')
    await expect(page.getByTestId('seance-progress')).toHaveText('1 sur 5')
    await expect(page.getByTestId('seance-activity')).toHaveAttribute('data-activity-type', 'traduction')
    await expect(page.getByTestId('seance-prev')).toBeDisabled()

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'f-460-seance-1440.png'),
      fullPage: true,
    })

    // Walk forward through the 5 activities.
    for (let step = 1; step <= 5; step++) {
      await expect(page.getByTestId('seance-progress')).toHaveText(`${step} sur 5`)
      await page.getByTestId('seance-next').click()
    }

    // Completion screen.
    await expect(page.getByTestId('seance-complete')).toBeVisible()
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'f-460-seance-complete-1440.png'),
      fullPage: true,
    })

    // Return to the carte: the loop has closed — education is completed and the
    // next ile (famille) is now current.
    await page.getByRole('link', { name: /retour a la carte/i }).click()
    await expect(page).toHaveURL(/\/carte$/)

    await expect(page.locator('[data-testid="carte-ile"][data-theme="education"]')).toHaveAttribute('data-status', 'completed')
    await expect(page.locator('[data-testid="carte-ile"][data-theme="famille"]')).toHaveAttribute('data-status', 'current')

    await page.context().tracing.stop({ path: path.join(TRACE_DIR, 'f-460.zip') })
  })

  test('previous steps back through the walk', async ({ page }) => {
    await page.goto('/seance?ile=education')
    await expect(page.getByTestId('seance-progress')).toHaveText('1 sur 5')
    await page.getByTestId('seance-next').click()
    await expect(page.getByTestId('seance-progress')).toHaveText('2 sur 5')
    await page.getByTestId('seance-prev').click()
    await expect(page.getByTestId('seance-progress')).toHaveText('1 sur 5')
  })

  test('a non-walkable ile shows the empty state', async ({ page }) => {
    // famille is locked behind education with no completions.
    await page.goto('/seance?ile=famille')
    await expect(page.getByTestId('seance-empty')).toBeVisible()
  })
})

test.describe('F-460 — La Seance (desktop 1440, dark)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test.beforeEach(async ({ page }) => {
    await authDark(page)
  })

  test('renders the walk in dark mode', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto('/seance?ile=education')
    await expect(page.locator('html')).toHaveClass(/dark/)
    await expect(page.getByTestId('seance-player')).toBeVisible()
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'f-460-seance-dark-1440.png'),
      fullPage: true,
    })
  })
})

test.describe('F-460 — La Seance (mobile 375, light)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page)
  })

  test('renders the walk on mobile', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto('/seance?ile=education')
    await expect(page.getByTestId('seance-player')).toBeVisible()
    await expect(page.getByTestId('seance-progress')).toHaveText('1 sur 5')
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'f-460-seance-375.png'),
      fullPage: true,
    })
  })
})
