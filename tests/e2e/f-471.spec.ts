// F-471 — La Carte: the single "learning path" (Duolingo-style bubble trail).
// Receipts:
//   f-471-carte-1440.png   (wide desktop, light)
//   f-471-carte-375.png    (mobile, light — SAME component)
// Trace: tests/traces/f-471.zip (desktop happy path).
//
// Replaces the F-462 serpentine + F-469/F-470 sea-world/baked-scene and the
// desktop/mobile split: ONE component (CartePath) renders the journey identically
// at every width. Asserts the journey invariants + the preserved DOM contract:
// 8 bubbles (grammaire + 7 themes), state-driven (done/current/locked), the single
// current-node CTA deep-links to and lands the real ile route, no horizontal
// overflow at either width, dark mode intact.

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

async function expectNoOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(0)
}

async function expectContract(page: Page) {
  await expect(page.getByTestId('carte-journey')).toBeVisible()
  await expect(page.getByTestId('carte-map')).toBeVisible()
  await expect(page.getByTestId('carte-level')).toHaveText('Niveau B1')

  // 8 bubbles: grammaire foundation + 7 themes.
  await expect(page.getByTestId('carte-bubble')).toHaveCount(8)
  const grammar = page.getByTestId('carte-grammar')
  await expect(grammar).toHaveAttribute('data-live', 'true')
  await expect(grammar).toHaveAttribute('data-theme', 'grammaire')

  const iles = page.getByTestId('carte-ile')
  await expect(iles).toHaveCount(7)
  await expect(iles.first()).toHaveAttribute('data-theme', 'education')
  await expect(iles.first()).toHaveAttribute('data-status', 'current')

  // A locked ile is non-navigable (aria-disabled role="link", no anchor).
  const locked = page.locator('[data-testid="carte-ile"][data-theme="famille"]')
  await expect(locked).toHaveAttribute('data-status', 'locked')
  await expect(locked.locator('a')).toHaveCount(0)
  await expect(locked.getByRole('link')).toHaveAttribute('aria-disabled', 'true')

  // Exactly one current-node CTA -> the canonical ile route.
  const cta = page.getByTestId('carte-current-cta')
  await expect(cta).toHaveCount(1)
  await expect(cta).toHaveAttribute('href', '/ile/education')
}

test.describe('F-471 — La Carte learning path (desktop 1440, light)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page)
  })

  test('renders the bubble trail, states, and lands the current ile route', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    ensureDir(TRACE_DIR)
    await page.context().tracing.start({ screenshots: true, snapshots: true })

    await page.goto('/carte')
    await expectContract(page)
    await expectNoOverflow(page)

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-471-carte-1440.png'), fullPage: true })

    // Continuer lands the real 3-beat ile page (F-458), not a 404.
    await page.getByTestId('carte-current-cta').click()
    await expect(page).toHaveURL(/\/ile\/education$/)
    await expect(page.getByTestId('ile-page')).toBeVisible()

    await page.context().tracing.stop({ path: path.join(TRACE_DIR, 'f-471.zip') })
  })
})

test.describe('F-471 — La Carte learning path (desktop 1440, dark)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test.beforeEach(async ({ page }) => {
    await authDark(page)
  })

  test('renders the trail + states intact in dark mode (token-driven)', async ({ page }) => {
    await page.goto('/carte')
    await expect(page.locator('html')).toHaveClass(/dark/)
    await expectContract(page)
    await expectNoOverflow(page)
  })
})

test.describe('F-471 — La Carte learning path (mobile 375, same component)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page)
  })

  test('renders the same trail with no horizontal overflow', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto('/carte')
    await expectContract(page)
    await expectNoOverflow(page)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-471-carte-375.png'), fullPage: true })
  })
})
