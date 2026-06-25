// F-484 - La Carte backbone scaffold (config-driven, content-free).
// Receipts:
//   f-484-carte-1440.png   (TCF grid, theme view, light)
//   f-484-carte-375.png    (TCF grid, stacked cards, light)
// Trace: tests/traces/f-484.zip (desktop happy path: toggle + persona swap).
//
// Proves the two backbone invariants without a component change:
//   1. The backbone renders cleanly all-bientot  -> the STUB persona case.
//   2. A new persona ships as config only        -> swapping getActivePersona's
//      source (the lm.activePersona seam) reshapes the grid with no code change.
// Plus: Le Cap / global rail / readiness render their bientot/zero states, and
// the theme|skill twin view toggles projections of the same station set.

import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { injectAuthToken } from '../helpers/auth-e2e'
import * as path from 'path'
import * as fs from 'fs'

const SCREENSHOT_DIR = path.join(__dirname, '../screenshots')
const TRACE_DIR = path.join(__dirname, '../traces')
const ACTIVE_PERSONA_KEY = 'lm.activePersona.v1'

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

async function setActivePersona(page: Page, id: string) {
  await page.addInitScript(
    ([key, value]) => localStorage.setItem(key, value),
    [ACTIVE_PERSONA_KEY, id] as const,
  )
}

test.describe('F-484 - carte backbone (desktop 1440, TCF persona)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page)
  })

  test('renders the 7x5 grid + Le Cap, rail, readiness, twin view', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    ensureDir(TRACE_DIR)
    await page.context().tracing.start({ screenshots: true, snapshots: true })

    await page.goto('/carte')
    await expect(page.getByTestId('carte-journey')).toBeVisible()

    // 7 theme rows (TCF keeps its real states; education current).
    await expect(page.getByTestId('carte-ile')).toHaveCount(7)
    // 5 level columns: Parcours + A1..C1 = 6 header cells, and C1 is present.
    const headers = page.locator('[data-testid="carte-map"] thead th')
    await expect(headers).toHaveCount(6)
    await expect(page.locator('[data-testid="carte-map"] thead th', { hasText: /^C1$/ })).toHaveCount(1)
    // Exactly one current CTA (real state preserved, theme-keyed route).
    await expect(page.getByTestId('carte-current-cta')).toHaveCount(1)

    // Backbone shells render their bientot / zero states.
    await expect(page.getByTestId('carte-lecap')).toHaveAttribute('data-state', 'bientot')
    await expect(page.getByTestId('carte-rail')).toBeVisible()
    await expect(page.getByTestId('carte-rail-srs')).toHaveAttribute('data-status', 'bientot')
    await expect(page.getByTestId('carte-readiness-value')).toHaveText('0 %')

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-484-carte-1440.png'), fullPage: true })

    // Twin view: theme -> skill -> theme, projections of the same station set.
    await page.getByTestId('carte-view-skill').click()
    await expect(page.getByTestId('carte-skill-view')).toBeVisible()
    await expect(page.getByTestId('carte-skill-group')).toHaveCount(4)
    await expect(page.locator('[data-testid="carte-map"] table')).toHaveCount(0)
    await page.getByTestId('carte-view-theme').click()
    await expect(page.locator('[data-testid="carte-map"] table')).toBeVisible()

    await page.context().tracing.stop({ path: path.join(TRACE_DIR, 'f-484.zip') })
  })
})

test.describe('F-484 - config-only proof (persona swap reshapes the grid)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('the STUB persona renders an all-bientot 3x2 grid with no code change', async ({ page }) => {
    await injectAuthToken(page)
    // Only the active-persona config differs; the component is identical.
    await setActivePersona(page, 'stub-proof')

    await page.goto('/carte')
    await expect(page.getByTestId('carte-journey')).toBeVisible()

    // Different themes: 3 mold rows (vs TCF's 7), and no grammar foundation.
    await expect(page.getByTestId('carte-ile')).toHaveCount(3)
    await expect(page.getByTestId('carte-grammar')).toHaveCount(0)
    // Different level axis: 2 columns (Parcours + A1 + A2 = 3 header cells).
    await expect(page.locator('[data-testid="carte-map"] thead th')).toHaveCount(3)

    // Invariant 1: every cell is bientot, zero live cells, zero current CTAs.
    const rows = page.getByTestId('carte-ile')
    for (let i = 0; i < 3; i++) {
      await expect(rows.nth(i)).toHaveAttribute('data-status', 'bientot')
    }
    await expect(page.getByTestId('carte-current-cta')).toHaveCount(0)
    await expect(page.getByTestId('carte-cell-slot').first()).toBeVisible()
  })
})

test.describe('F-484 - carte backbone (mobile 375, TCF persona)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page)
  })

  test('stacks to cards with no horizontal overflow', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto('/carte')
    await expect(page.getByTestId('carte-journey')).toBeVisible()
    await expect(page.getByTestId('carte-ile')).toHaveCount(7)
    // <640 stacks to cards: no <table>.
    await expect(page.locator('[data-testid="carte-map"] table')).toHaveCount(0)
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-484-carte-375.png'), fullPage: true })
  })
})
