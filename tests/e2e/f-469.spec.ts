// F-469 — La Carte: immersive sea-world + scatter layout (FE).
// Receipts:
//   f-469-carte-1920-light.png   (desktop world, light)
//   f-469-carte-1920-dark.png    (desktop world, dark)
//   f-469-carte-375.png          (mobile vertical serpentine)
// Trace: tests/traces/f-469.zip (desktop happy path).
//
// Covers the F-469 desktop sea-world while preserving the journey invariants:
// >=1024px renders the 8-island scatter (grammaire + 7 themes) over the sea with
// one coral trail; the grammar foundation is now its own island; each island art
// actually loads (complete && naturalWidth>0, the F-461 no-404 lesson); the
// single current-node CTA lives on the floating card and deep-links to the
// canonical ile route (and lands the real ile page); <1024px keeps the vertical
// serpentine; both presentations expose the same DOM contract; no 375 overflow.

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

// Every island PNG must be served, not just referenced — the F-461 prod incident
// (untracked asset 404ing on deploy) is guarded by asserting decoded pixels.
async function expectIslandsLoaded(page: Page, count: number) {
  const imgs = page.getByTestId('island-node').locator('img')
  await expect(imgs).toHaveCount(count)
  await expect
    .poll(() =>
      imgs.evaluateAll((els) =>
        els.every((el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0),
      ),
    )
    .toBe(true)
}

test.describe('F-469 — La Carte sea-world (desktop 1920, light)', () => {
  test.use({ viewport: { width: 1920, height: 1080 } })

  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page)
  })

  test('renders the 8-island scatter, the floating card CTA, and lands the ile route', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    ensureDir(TRACE_DIR)
    await page.context().tracing.start({ screenshots: true, snapshots: true })

    await page.goto('/carte')

    // World shell + level header.
    await expect(page.getByTestId('carte-journey')).toBeVisible()
    await expect(page.getByTestId('carte-map')).toBeVisible()
    await expect(page.getByTestId('carte-level')).toHaveText('Niveau B1')

    // 8 islands: grammaire foundation + 7 themes, all art decoded (no 404).
    await expectIslandsLoaded(page, 8)

    // Grammar is now its own island (not the mobile marker), live at B1.
    const grammar = page.getByTestId('carte-grammar')
    await expect(grammar).toHaveAttribute('data-live', 'true')
    await expect(grammar).toHaveAttribute('data-theme', 'grammaire')
    await expect(grammar.getByTestId('island-node')).toHaveCount(1)

    // 7 ile islands, education first + current.
    const iles = page.getByTestId('carte-ile')
    await expect(iles).toHaveCount(7)
    await expect(iles.first()).toHaveAttribute('data-theme', 'education')
    await expect(iles.first()).toHaveAttribute('data-status', 'current')

    // The coral trail threads the islands.
    await expect(page.locator('[data-testid="carte-map"] svg path').first()).toBeAttached()

    // Buoys are checkpoint markers, not islands: 7 mini-mocks + 1 final.
    await expect(page.getByTestId('carte-mini-mock')).toHaveCount(7)
    await expect(page.getByTestId('carte-final-mock')).toBeVisible()

    // The floating current card names the real current ile + real progress, and
    // holds the single current-node CTA pointing at the canonical ile route.
    const card = page.getByTestId('carte-current-card')
    await expect(card).toBeVisible()
    await expect(card).toContainText("Île 1 : L'éducation")
    await expect(page.getByTestId('carte-progress-pct')).toHaveText('0%')

    const cta = page.getByTestId('carte-current-cta')
    await expect(cta).toHaveCount(1)
    await expect(cta).toHaveAttribute('href', '/ile/education')

    // No horizontal overflow at 1920 (full-bleed sea must not push the page).
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-469-carte-1920-light.png'), fullPage: true })

    // Continuer lands the real 3-beat ile page (F-458), not a 404.
    await cta.click()
    await expect(page).toHaveURL(/\/ile\/education$/)
    await expect(page.getByTestId('ile-page')).toBeVisible()

    await page.context().tracing.stop({ path: path.join(TRACE_DIR, 'f-469.zip') })
  })
})

test.describe('F-469 — La Carte sea-world (desktop 1920, dark)', () => {
  test.use({ viewport: { width: 1920, height: 1080 } })

  test.beforeEach(async ({ page }) => {
    await authDark(page)
  })

  test('renders the dark sea with the islands intact', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto('/carte')
    await expect(page.locator('html')).toHaveClass(/dark/)
    await expect(page.getByTestId('carte-map')).toBeVisible()
    await expectIslandsLoaded(page, 8)
    await expect(page.getByTestId('carte-current-cta')).toBeVisible()
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-469-carte-1920-dark.png'), fullPage: true })
  })
})

test.describe('F-469 — La Carte (mobile 375, vertical serpentine)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page)
  })

  test('keeps the vertical flow below 1024 with no horizontal overflow', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto('/carte')
    await expect(page.getByTestId('carte-map')).toBeVisible()

    // Mobile is the serpentine: 7 ile nodes, grammar is a marker (not an island).
    await expect(page.getByTestId('carte-ile')).toHaveCount(7)
    await expect(page.getByTestId('carte-grammar').getByTestId('island-node')).toHaveCount(0)

    // Same DOM contract: the single current-node CTA to the canonical ile route.
    const cta = page.getByTestId('carte-current-cta')
    await expect(cta).toHaveCount(1)
    await expect(cta).toHaveAttribute('href', '/ile/education')

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-469-carte-375.png'), fullPage: true })
  })
})
