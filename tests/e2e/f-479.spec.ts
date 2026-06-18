// F-479 — nav consolidation. The TopNav floating pill is the single logged-out
// marketing nav across every route StickyHeader used to serve. This spec proves
// the pill (and its brand logo) actually renders + decodes on those routes, and
// that the dashboard top bar is the matching centered pill.
//
// Gate (per dispatch): the nav logo must DECODE (complete && naturalWidth > 0)
// on the previously-StickyHeader routes — a 404'd <img> still has a src
// (F-461 lesson), so assert the pixels, not just the attribute.

import { test, expect } from '@playwright/test'
import type { Locator } from '@playwright/test'
import { injectAuthToken } from '../helpers/auth-e2e'
import * as path from 'path'
import * as fs from 'fs'

const SCREENSHOT_DIR = path.join(__dirname, '../screenshots')
function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

async function expectDecoded(img: Locator) {
  await expect(img).toBeVisible()
  await expect
    .poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0), {
      timeout: 10_000,
    })
    .toBe(true)
}

// Every route StickyHeader used to own — now served by the TopNav pill.
const MIGRATED_ROUTES = [
  '/tarifs',
  '/librairie',
  '/examens',
  '/pieges',
  '/a-propos',
  '/faq',
  '/inscription',
  '/mentions-legales',
] as const

test.describe('F-479 — pill nav on previously-StickyHeader routes (desktop 1440)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  for (const route of MIGRATED_ROUTES) {
    test(`TopNav pill + decoded brand logo on ${route}`, async ({ page }) => {
      ensureDir(SCREENSHOT_DIR)
      await page.goto(route)
      const nav = page.getByTestId('topnav-desktop')
      await expect(nav).toBeVisible()
      // StickyHeader is retired — its testid must be gone everywhere.
      expect(await page.getByTestId('sticky-header').count()).toBe(0)
      await expectDecoded(nav.getByTestId('topnav-logo-img'))
      const slug = route.replace(/\//g, '') || 'home'
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `f-479-${slug}-1440.png`), fullPage: false })
    })
  }

  test('the pill is a centered capsule, not a full-bleed bar', async ({ page }) => {
    await page.goto('/tarifs')
    const nav = page.getByTestId('topnav-desktop')
    await expect(nav).toBeVisible()
    const box = await nav.boundingBox()
    expect(box).not.toBeNull()
    // Detached from the viewport edges (centered with side gaps).
    expect(box!.x).toBeGreaterThan(8)
    expect(box!.width).toBeLessThan(1440 - 8)
  })
})

test.describe('F-479 — mobile pill header on migrated routes (375)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  for (const route of ['/tarifs', '/librairie', '/examens'] as const) {
    test(`mobile pill + decoded logo on ${route}`, async ({ page }) => {
      ensureDir(SCREENSHOT_DIR)
      await page.goto(route)
      const header = page.getByTestId('topnav-mobile')
      await expect(header).toBeVisible()
      await expectDecoded(header.getByTestId('topnav-logo-img-mobile'))
      const slug = route.replace(/\//g, '') || 'home'
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `f-479-${slug}-375.png`), fullPage: false })
    })
  }
})

test.describe('F-479 — dashboard top bar is the matching centered pill (authed, 1440)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page)
  })

  test('app top bar renders as a detached centered pill (not full-bleed)', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto('/tableau-de-bord')
    const topbar = page.locator('.app-topbar')
    await expect(topbar).toBeVisible()
    // No marketing links in the logged-in bar.
    await expect(topbar.getByRole('link', { name: 'Pricing' })).toHaveCount(0)
    await expect(topbar.getByRole('link', { name: 'Start Free' })).toHaveCount(0)
    const box = await topbar.boundingBox()
    expect(box).not.toBeNull()
    // Detached: gap on the right edge and not spanning the full viewport width.
    expect(box!.x + box!.width).toBeLessThan(1440 - 8)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-479-dashboard-1440.png'), fullPage: false })
  })
})
