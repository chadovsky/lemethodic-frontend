// F-457 — La Carte journey map (FE).
// Receipts:
//   f-457-carte-1440.png      / -375.png        (light)
//   f-457-carte-dark-1440.png                   (dark)
// Trace: tests/traces/f-457.zip (desktop happy path).
//
// Covers: journey renders at B1, education-first current ile, the single
// primary CTA points at the canonical ile route and lands on the IleShell
// bientot stub (no 404), and the dashboard entry wires through to /carte.

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

test.describe('F-457 — La Carte (desktop 1440, light)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page)
  })

  test('renders the journey trail, current ile CTA, and lands the ile route', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    ensureDir(TRACE_DIR)
    await page.context().tracing.start({ screenshots: true, snapshots: true })

    await page.goto('/carte')

    // Journey + level header.
    await expect(page.getByTestId('carte-journey')).toBeVisible()
    await expect(page.getByTestId('carte-level')).toHaveText('Niveau B1')

    // 7 iles, education first + current.
    const iles = page.getByTestId('carte-ile')
    await expect(iles).toHaveCount(7)
    await expect(iles.first()).toHaveAttribute('data-theme', 'education')
    await expect(iles.first()).toHaveAttribute('data-status', 'current')

    // Mini-mocks (7) + final mock (1).
    await expect(page.getByTestId('carte-mini-mock')).toHaveCount(7)
    await expect(page.getByTestId('carte-final-mock')).toBeVisible()

    // Exactly one primary CTA, to the canonical ile route.
    const cta = page.getByTestId('carte-current-cta')
    await expect(cta).toHaveCount(1)
    await expect(cta).toHaveAttribute('href', '/ile/education')

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-457-carte-1440.png'), fullPage: true })

    // No broken nav: the CTA target is a real route that lands on the IleShell
    // bientot stub (no 404), since the education ile has no MDX authored yet.
    await page.goto('/ile/education')
    await expect(page).toHaveURL(/\/ile\/education$/)
    await expect(page.getByText(/cette île arrive prochainement/i)).toBeVisible()

    await page.context().tracing.stop({ path: path.join(TRACE_DIR, 'f-457.zip') })
  })

  test('dashboard entry wires through to /carte', async ({ page }) => {
    await page.goto('/tableau-de-bord')
    const entry = page.getByTestId('dashboard-carte-entry')
    await expect(entry).toBeVisible()
    await entry.click()
    await expect(page).toHaveURL(/\/carte$/)
    await expect(page.getByTestId('carte-journey')).toBeVisible()
  })
})

test.describe('F-457 — La Carte (desktop 1440, dark)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test.beforeEach(async ({ page }) => {
    await authDark(page)
  })

  test('renders in dark mode', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto('/carte')
    await expect(page.locator('html')).toHaveClass(/dark/)
    await expect(page.getByTestId('carte-journey')).toBeVisible()
    await expect(page.getByTestId('carte-current-cta')).toBeVisible()
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-457-carte-dark-1440.png'), fullPage: true })
  })
})

test.describe('F-457 — La Carte (mobile 375, light)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page)
  })

  test('renders the trail on mobile', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto('/carte')
    await expect(page.getByTestId('carte-journey')).toBeVisible()
    await expect(page.getByTestId('carte-ile')).toHaveCount(7)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-457-carte-375.png'), fullPage: true })
  })
})
