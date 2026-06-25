// F-472 — La Carte: informative table (replaces the F-471 bubble trail).
// Receipts:
//   f-472-carte-1440.png   (table, light)
//   f-472-carte-1440-dark.png
//   f-472-carte-375.png    (stacked cards, light)
// Trace: tests/traces/f-472.zip (desktop happy path).
//
// Asserts the journey invariants + the preserved DOM contract on the table:
// 8 rows (grammaire + 7 themes), state-driven (done/current/locked), the single
// current CTA deep-links to and lands the real ile route, the table renders at
// 1440 and stacks to cards at 375 (no horizontal scroll), dark mode intact.

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

  // 8 rows: grammaire foundation + 7 themes.
  const grammar = page.getByTestId('carte-grammar')
  await expect(grammar).toHaveAttribute('data-live', 'true')
  await expect(grammar).toHaveAttribute('data-theme', 'grammaire')

  const iles = page.getByTestId('carte-ile')
  await expect(iles).toHaveCount(7)
  await expect(iles.first()).toHaveAttribute('data-theme', 'education')
  await expect(iles.first()).toHaveAttribute('data-status', 'current')

  // F-484 no-gates: a non-current theme is an inert bientot slot, not a locked
  // gate. No Verrouillé, no nav link.
  const bientot = page.locator('[data-testid="carte-ile"][data-theme="famille"]')
  await expect(bientot).toHaveAttribute('data-status', 'bientot')
  await expect(bientot.getByTestId('carte-cell-slot').first()).toBeVisible()
  await expect(bientot.getByText('Verrouillé')).toHaveCount(0)
  await expect(bientot.locator('a')).toHaveCount(0)

  // Exactly one current CTA -> the canonical ile route.
  const cta = page.getByTestId('carte-current-cta')
  await expect(cta).toHaveCount(1)
  await expect(cta).toHaveAttribute('href', '/ile/education')
}

test.describe('F-472 — La Carte table (desktop 1440, light)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page)
  })

  test('renders the table, states, and lands the current ile route', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    ensureDir(TRACE_DIR)
    await page.context().tracing.start({ screenshots: true, snapshots: true })

    await page.goto('/carte')
    await expectContract(page)
    // The >=640 layout is a real table.
    await expect(page.locator('[data-testid="carte-map"] table')).toBeVisible()
    await expectNoOverflow(page)

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-472-carte-1440.png'), fullPage: true })

    await page.getByTestId('carte-current-cta').click()
    await expect(page).toHaveURL(/\/ile\/education$/)
    await expect(page.getByTestId('ile-page')).toBeVisible()

    await page.context().tracing.stop({ path: path.join(TRACE_DIR, 'f-472.zip') })
  })
})

test.describe('F-472 — La Carte table (desktop 1440, dark)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test.beforeEach(async ({ page }) => {
    await authDark(page)
  })

  test('renders the table + states intact in dark mode (token-driven)', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto('/carte')
    await expect(page.locator('html')).toHaveClass(/dark/)
    await expectContract(page)
    await expectNoOverflow(page)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-472-carte-1440-dark.png'), fullPage: true })
  })
})

test.describe('F-472 — La Carte table (mobile 375, stacked cards)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page)
  })

  test('stacks each ile as a card with no horizontal scroll', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto('/carte')
    await expectContract(page)
    // <640 stacks to cards: no <table> rendered.
    await expect(page.locator('[data-testid="carte-map"] table')).toHaveCount(0)
    await expectNoOverflow(page)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-472-carte-375.png'), fullPage: true })
  })
})
