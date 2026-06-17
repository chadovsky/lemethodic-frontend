// F-475 — TopNav brand logo + logo sizing.
// Receipts:
//   f-475-landing-1440.png   (TopNav desktop with brand logo)
//   f-475-landing-375.png    (TopNav mobile header logo)
//   f-475-connexion-1440.png (focused sign-in card, enlarged logo, no header)
//   f-475-connexion-375.png
//   f-475-sidebar-1440.png   (expanded rail with enlarged wordmark)
// Trace: tests/traces/f-475.zip (la-methode → logo click → home happy path).
//
// Gate (per dispatch): the TopNav + sign-in logos must actually decode
// (complete && naturalWidth > 0), not merely have a src — a broken/404 <img>
// still has a src (F-461 lesson). The sizing assertions confirm the enlargement
// shipped, not just that an image is present.

import { test, expect } from '@playwright/test'
import type { Locator } from '@playwright/test'
import { injectAuthToken } from '../helpers/auth-e2e'
import * as path from 'path'
import * as fs from 'fs'

const SCREENSHOT_DIR = path.join(__dirname, '../screenshots')
const TRACE_DIR = path.join(__dirname, '../traces')

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

test.describe('F-475 — TopNav brand logo (desktop 1440)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('landing nav shows the brand logo and it decodes', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: 'Primary' })
    await expect(nav).toBeVisible()
    const logo = page.getByTestId('topnav-logo-img')
    await expectDecoded(logo)
    await expect(logo.locator('xpath=ancestor::a[1]')).toHaveAttribute('href', '/')

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-475-landing-1440.png'), fullPage: false })
  })

  test('clicking the logo navigates home (happy path)', async ({ page }) => {
    ensureDir(TRACE_DIR)
    // Trace start/stop must bracket the same context (fullyParallel gives each
    // test its own), so the trace lives entirely inside this happy-path test.
    await page.context().tracing.start({ screenshots: true, snapshots: true })
    // TopNav desktop renders on /la-methode (public); the logo links home.
    await page.goto('/la-methode')
    await expect(page.getByTestId('topnav-desktop')).toBeVisible()
    await page.getByTestId('topnav-logo-img').click()
    await expect(page).toHaveURL('/')
    await page.context().tracing.stop({ path: path.join(TRACE_DIR, 'f-475.zip') })
  })
})

test.describe('F-475 — TopNav brand logo (mobile 375)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('mobile header logo decodes and no horizontal overflow', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto('/')
    await expect(page.getByTestId('topnav-mobile')).toBeVisible()
    await expectDecoded(page.getByTestId('topnav-logo-img-mobile'))
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-475-landing-375.png'), fullPage: false })
  })
})

test.describe('F-475 — focused sign-in surface (desktop 1440)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('no marketing header; the enlarged card logo decodes', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto('/connexion')
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
    // Focused auth surface — the global StickyHeader does not render here.
    await expect(page.getByTestId('sticky-header')).toHaveCount(0)

    const logo = page.getByTestId('connexion-logo')
    await expectDecoded(logo)
    // Enlarged to ~200px wide (was ~64px). Assert it genuinely grew.
    const box = await logo.boundingBox()
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(180)

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-475-connexion-1440.png'), fullPage: true })
  })
})

test.describe('F-475 — focused sign-in surface (mobile 375)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('card logo decodes and no horizontal overflow', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto('/connexion')
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
    await expectDecoded(page.getByTestId('connexion-logo'))
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-475-connexion-375.png'), fullPage: true })
  })
})

test.describe('F-475 — sidebar expanded wordmark (desktop 1440)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page)
  })

  test('expanded rail shows the enlarged wordmark and it decodes', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto('/tableau-de-bord')

    await page.getByTestId('app-shell-sidebar').hover()
    await expect(page.getByTestId('app-shell-sidebar')).toHaveAttribute('data-expanded', 'true')

    const logo = page.getByTestId('sidebar-logo-img')
    await expectDecoded(logo)
    // Enlarged to ~150px wide (was ~56px). Assert it genuinely grew.
    const box = await logo.boundingBox()
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(130)

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-475-sidebar-1440.png'), fullPage: false })
  })
})
