// F-470 — La Carte: baked Nano Banana scene + interactive overlays (FE).
// Receipts:
//   f-470-carte-1920.png   (desktop scene + overlays, light)
//   f-470-carte-375.png    (mobile vertical serpentine, unchanged)
// Trace: tests/traces/f-470.zip (desktop happy path).
//
// Supersedes the F-469 CSS sea-world on desktop. >=1024px now renders ONE baked
// image (carte-scene-light.png) with 8 invisible hotspots overlaid in percent of
// the image; the grammar foundation + 7 themes keep the same DOM contract
// (data-theme/data-status, /ile links, the single carte-current-cta). The baked
// image must actually decode (no 404 — the F-461 untracked-asset lesson). The
// current-node Continuer deep-links to and lands the real ile page; locked iles
// are aria-disabled; <1024px keeps the F-462 serpentine untouched.

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

// The baked scene must be served + decoded, not just referenced — the F-461 prod
// incident (untracked asset 404ing on deploy) is guarded by asserting pixels.
async function expectSceneDecoded(page: Page) {
  const scene = page.getByTestId('carte-scene')
  await expect(scene).toBeVisible()
  await expect
    .poll(() =>
      scene.evaluate((el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0),
    )
    .toBe(true)
}

test.describe('F-470 — La Carte baked scene (desktop 1920, light)', () => {
  test.use({ viewport: { width: 1920, height: 1080 } })

  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page)
  })

  test('renders the baked scene, 8 hotspots, and lands the current ile route', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    ensureDir(TRACE_DIR)
    await page.context().tracing.start({ screenshots: true, snapshots: true })

    await page.goto('/carte')

    // Shell + level header.
    await expect(page.getByTestId('carte-journey')).toBeVisible()
    await expect(page.getByTestId('carte-map')).toBeVisible()
    await expect(page.getByTestId('carte-level')).toHaveText('Niveau B1')

    // The scene is a real baked image (decodes, no 404), not painted CSS water.
    await expectSceneDecoded(page)

    // The coral chain is an SVG overlay threading the hotspots (no painted path
    // in the baked image).
    await expect(page.getByTestId('carte-path')).toBeAttached()
    await expect(page.locator('[data-testid="carte-path"] path').first()).toBeAttached()

    // 8 hotspots over the image: grammar foundation + 7 themes. No painted islands.
    await expect(page.getByTestId('island-node')).toHaveCount(0)
    const grammar = page.getByTestId('carte-grammar')
    await expect(grammar).toHaveAttribute('data-live', 'true')
    await expect(grammar).toHaveAttribute('data-theme', 'grammaire')

    const iles = page.getByTestId('carte-ile')
    await expect(iles).toHaveCount(7)
    await expect(iles.first()).toHaveAttribute('data-theme', 'education')
    await expect(iles.first()).toHaveAttribute('data-status', 'current')

    // Current island is clickable (its zone is an anchor to the ile route).
    await expect(iles.first().locator('a')).toHaveAttribute('href', '/ile/education')

    // A locked island is click-disabled (aria-disabled role="link", no anchor).
    const lockedIle = page.locator('[data-testid="carte-ile"][data-theme="famille"]')
    await expect(lockedIle).toHaveAttribute('data-status', 'locked')
    await expect(lockedIle.locator('a')).toHaveCount(0)
    await expect(lockedIle.getByRole('link')).toHaveAttribute('aria-disabled', 'true')

    // The floating current card names the real current ile + real progress and
    // holds the single current-node CTA pointing at the canonical ile route.
    const card = page.getByTestId('carte-current-card')
    await expect(card).toBeVisible()
    await expect(card).toContainText("Île 1 : L'éducation")
    await expect(page.getByTestId('carte-progress-pct')).toHaveText('0%')

    const cta = page.getByTestId('carte-current-cta')
    await expect(cta).toHaveCount(1)
    await expect(cta).toHaveAttribute('href', '/ile/education')

    // No horizontal overflow at 1920 (full-bleed scene must not push the page).
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-470-carte-1920.png'), fullPage: true })

    // Continuer lands the real 3-beat ile page (F-458), not a 404.
    await cta.click()
    await expect(page).toHaveURL(/\/ile\/education$/)
    await expect(page.getByTestId('ile-page')).toBeVisible()

    await page.context().tracing.stop({ path: path.join(TRACE_DIR, 'f-470.zip') })
  })
})

test.describe('F-470 — La Carte baked scene (desktop 1920, dark)', () => {
  test.use({ viewport: { width: 1920, height: 1080 } })

  test.beforeEach(async ({ page }) => {
    await authDark(page)
  })

  test('renders the scene + overlays intact in dark mode (light asset for now)', async ({ page }) => {
    await page.goto('/carte')
    await expect(page.locator('html')).toHaveClass(/dark/)
    await expect(page.getByTestId('carte-map')).toBeVisible()
    await expectSceneDecoded(page)
    await expect(page.getByTestId('carte-ile')).toHaveCount(7)
    await expect(page.getByTestId('carte-current-cta')).toBeVisible()
  })
})

test.describe('F-470 — La Carte (mobile 375, vertical serpentine untouched)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page)
  })

  test('keeps the F-462 serpentine below 1024 with no horizontal overflow', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto('/carte')
    await expect(page.getByTestId('carte-map')).toBeVisible()

    // Mobile stays the serpentine: no baked scene image, grammar is a marker.
    await expect(page.getByTestId('carte-scene')).toHaveCount(0)
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

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-470-carte-375.png'), fullPage: true })
  })
})
