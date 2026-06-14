// F-459 - Le Diagnostic: deliberate level assignment (FE).
// Receipts:
//   f-459-bienvenue-level-1440.png / -375.png   (light, the level step)
//   f-459-bienvenue-level-dark-1440.png         (dark)
// Trace: tests/traces/f-459.zip (diagnostic -> carte happy path).
//
// Covers: the 4-step /bienvenue capture reaches a starting-level step, the
// chosen level is written to the profile, and the learner lands on /carte with
// that level applied (the carte renders the assigned map).

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

// Walk the first three steps up to the starting-level step.
async function advanceToLevelStep(page: Page) {
  await page.getByRole('button', { name: 'TCF' }).click()
  await page.getByRole('button', { name: 'Continuer' }).click()

  await page.getByRole('button', { name: 'B2 (CLB 7-8)' }).click()
  await page.getByRole('button', { name: 'Continuer' }).click()

  await page.getByRole('button', { name: /Plateau à surmonter/ }).click()
  await page.getByRole('button', { name: 'Continuer' }).click()

  await expect(page.getByTestId('bienvenue-level-step')).toBeVisible()
}

async function authDark(page: Page) {
  await injectAuthToken(page)
  await page.addInitScript(() => localStorage.setItem('theme', 'dark'))
}

test.describe('F-459 - Le Diagnostic (desktop 1440, light)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page)
  })

  test('assigns a level and lands on the carte with it applied', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    ensureDir(TRACE_DIR)
    await page.context().tracing.start({ screenshots: true, snapshots: true })

    await page.goto('/bienvenue')
    await advanceToLevelStep(page)

    // The five CEFR bands, B1 seeded as the default selection.
    for (const band of ['A1', 'A2', 'B1', 'B2', 'C1']) {
      await expect(page.getByTestId(`bienvenue-level-${band}`)).toBeVisible()
    }
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'f-459-bienvenue-level-1440.png'),
      fullPage: true,
    })

    // Adjust to A2, then complete -> diagnostic -> carte chain.
    await page.getByTestId('bienvenue-level-A2').click()
    await page.getByRole('button', { name: 'Commencer mon parcours' }).click()

    await expect(page).toHaveURL(/\/carte$/)
    await expect(page.getByTestId('carte-journey')).toBeVisible()
    await expect(page.getByTestId('carte-level')).toHaveText('Niveau A2')

    await page.context().tracing.stop({ path: path.join(TRACE_DIR, 'f-459.zip') })
  })
})

test.describe('F-459 - Le Diagnostic (desktop 1440, dark)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test.beforeEach(async ({ page }) => {
    await authDark(page)
  })

  test('renders the level step in dark mode', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto('/bienvenue')
    await expect(page.locator('html')).toHaveClass(/dark/)
    await advanceToLevelStep(page)
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'f-459-bienvenue-level-dark-1440.png'),
      fullPage: true,
    })
  })
})

test.describe('F-459 - Le Diagnostic (mobile 375, light)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page)
  })

  test('reaches the level step and completes on mobile', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto('/bienvenue')
    await advanceToLevelStep(page)
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'f-459-bienvenue-level-375.png'),
      fullPage: true,
    })

    await page.getByRole('button', { name: 'Commencer mon parcours' }).click()
    await expect(page).toHaveURL(/\/carte$/)
    await expect(page.getByTestId('carte-level')).toHaveText('Niveau B1')
  })
})
