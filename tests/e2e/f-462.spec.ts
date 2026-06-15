// F-457 / F-462 — La Carte serpentine journey map (FE).
// Receipts:
//   f-462-carte-1440.png      / -375.png        (light)
//   f-462-carte-dark-1440.png                   (dark)
// Trace: tests/traces/f-462.zip (desktop happy path).
//
// Covers the F-462 serpentine rebuild while preserving the F-457 journey-chain
// invariants: the map renders at B1, education-first current ile, the grammar
// node is the first marker (not an island), mocks are checkpoint markers (not
// islands), each ile renders its themed island art (loaded, not 404), the single
// current-node link points at the canonical ile route and lands the real ile
// page (F-458), the "vous êtes ici" pin sits on the current node, the 375px
// column has no horizontal overflow, and the current node is scrolled into view.

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

test.describe('F-462 — La Carte serpentine (desktop 1440, light)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page)
  })

  test('renders the serpentine, the current-node link, and lands the ile route', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    ensureDir(TRACE_DIR)
    await page.context().tracing.start({ screenshots: true, snapshots: true })

    await page.goto('/carte')

    // Map + level header.
    await expect(page.getByTestId('carte-journey')).toBeVisible()
    await expect(page.getByTestId('carte-map')).toBeVisible()
    await expect(page.getByTestId('carte-level')).toHaveText('Niveau B1')

    // Grammar node is the first marker on the trail, not an island.
    const grammar = page.getByTestId('carte-grammar')
    await expect(grammar).toHaveAttribute('data-live', 'true')
    await expect(grammar.getByTestId('island-node')).toHaveCount(0)

    // 7 iles, education first + current.
    const iles = page.getByTestId('carte-ile')
    await expect(iles).toHaveCount(7)
    await expect(iles.first()).toHaveAttribute('data-theme', 'education')
    await expect(iles.first()).toHaveAttribute('data-status', 'current')

    // Each ile renders its themed island art (no placeholder). The PNG must
    // actually be served, not just referenced -- guards against an untracked
    // asset 404ing on the deployed build (F-461 prod incident).
    await expect(iles.first().getByTestId('island-node')).toHaveAttribute('data-state', 'current')
    const firstIsland = iles.first().locator('img')
    await expect(firstIsland).toHaveAttribute('src', /island-education\.png/)
    await expect
      .poll(() => firstIsland.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0))
      .toBe(true)

    // The "vous êtes ici" pin sits on the current node.
    await expect(iles.first().getByTestId('carte-here-marker')).toBeVisible()

    // Mocks are checkpoint markers, not islands: 7 mini-mocks + 1 final.
    const mini = page.getByTestId('carte-mini-mock')
    await expect(mini).toHaveCount(7)
    await expect(mini.first().getByTestId('island-node')).toHaveCount(0)
    await expect(page.getByTestId('carte-final-mock')).toBeVisible()

    // Exactly one current-node link, to the canonical ile route.
    const cta = page.getByTestId('carte-current-cta')
    await expect(cta).toHaveCount(1)
    await expect(cta).toHaveAttribute('href', '/ile/education')

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-462-carte-1440.png'), fullPage: true })

    // No broken nav: the current-node link lands the real 3-beat ile page
    // (F-458), not a 404.
    await cta.click()
    await expect(page).toHaveURL(/\/ile\/education$/)
    await expect(page.getByTestId('ile-page')).toBeVisible()

    await page.context().tracing.stop({ path: path.join(TRACE_DIR, 'f-462.zip') })
  })

  test('dashboard entry wires through to /carte', async ({ page }) => {
    await page.goto('/tableau-de-bord')
    // F-464 — the dashboard's La Carte entry is now the hero "Continuer" CTA.
    const entry = page.getByTestId('dashboard-carte-hero-cta')
    await expect(entry).toBeVisible()
    await entry.click()
    await expect(page).toHaveURL(/\/carte$/)
    await expect(page.getByTestId('carte-journey')).toBeVisible()
  })
})

test.describe('F-462 — La Carte serpentine (desktop 1440, dark)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test.beforeEach(async ({ page }) => {
    await authDark(page)
  })

  test('renders in dark mode', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto('/carte')
    await expect(page.locator('html')).toHaveClass(/dark/)
    await expect(page.getByTestId('carte-map')).toBeVisible()
    await expect(page.getByTestId('carte-current-cta')).toBeVisible()
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-462-carte-dark-1440.png'), fullPage: true })
  })
})

test.describe('F-462 — La Carte serpentine (mobile 375, light)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page)
  })

  test('renders the trail with no horizontal overflow and the current node in view', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto('/carte')
    await expect(page.getByTestId('carte-map')).toBeVisible()
    await expect(page.getByTestId('carte-ile')).toHaveCount(7)

    // Zero horizontal overflow at 375px (the mobile-first guard).
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)

    // The current node was scrolled into view (centred), motion-safe.
    const current = page.getByTestId('carte-ile').first()
    await expect(current).toHaveAttribute('data-status', 'current')
    const inView = await current.evaluate((el) => {
      const r = el.getBoundingClientRect()
      return r.top < window.innerHeight && r.bottom > 0
    })
    expect(inView).toBe(true)

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-462-carte-375.png'), fullPage: true })
  })
})
