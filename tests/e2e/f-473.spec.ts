// F-473 — brand logo wiring (favicon + sidebar header + sign-in restyle).
// Receipts:
//   f-473-connexion-1440.png  (sign-in card, centered wordmark)
//   f-473-connexion-375.png
//   f-473-sidebar-1440.png    (rail expanded → wordmark)
//   f-473-sidebar-375.png     (drawer open → wordmark)
// Trace: tests/traces/f-473.zip (connexion → asset decode happy path).
//
// The logo + mark must actually decode (complete && naturalWidth > 0), not just
// have a src set — the F-461 lesson: untracked /public assets pass CI but 404 in
// prod, and a broken <img> still has a src. So these assertions are the real gate.

import { test, expect } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'
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
  // Poll until the bytes actually finish decoding — the full wordmark is ~900KB
  // and may still be loading the instant it becomes layout-visible. complete &&
  // naturalWidth>0 is the real "it loaded, not 404" gate (F-461 lesson).
  await expect
    .poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0), {
      timeout: 10_000,
    })
    .toBe(true)
}

test.describe('F-473 — sign-in card (desktop 1440)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('renders the centered brand wordmark and it decodes', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    ensureDir(TRACE_DIR)
    await page.context().tracing.start({ screenshots: true, snapshots: true })

    await page.goto('/connexion')
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
    await expectDecoded(page.getByTestId('connexion-logo'))
    // Submit button is filled with the v3 accent token (not ink/purple).
    const btnBg = await page
      .getByRole('button', { name: 'Sign in' })
      .evaluate((el) => getComputedStyle(el).backgroundColor)
    // #E05C42 → rgb(224, 92, 66)
    expect(btnBg).toBe('rgb(224, 92, 66)')

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-473-connexion-1440.png'), fullPage: true })
    await page.context().tracing.stop({ path: path.join(TRACE_DIR, 'f-473.zip') })
  })
})

test.describe('F-473 — sign-in card (mobile 375)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('wordmark decodes and no horizontal overflow', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto('/connexion')
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
    await expectDecoded(page.getByTestId('connexion-logo'))
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-473-connexion-375.png'), fullPage: true })
  })
})

test.describe('F-473 — sidebar brand (desktop 1440)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page)
  })

  test('rail rests on the square mark; hover swaps to the full wordmark; both decode', async ({
    page,
  }: {
    page: Page
  }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto('/tableau-de-bord')

    // Collapsed rest state → square mark.
    await expectDecoded(page.getByTestId('sidebar-mark-img'))
    await expect(page.getByTestId('sidebar-mark')).toHaveAttribute('href', '/tableau-de-bord')

    // Hover expands the rail → full wordmark.
    await page.getByTestId('app-shell-sidebar').hover()
    await expect(page.getByTestId('app-shell-sidebar')).toHaveAttribute('data-expanded', 'true')
    await expectDecoded(page.getByTestId('sidebar-logo-img'))
    await expect(page.getByTestId('sidebar-wordmark')).toHaveAttribute('href', '/tableau-de-bord')

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-473-sidebar-1440.png'), fullPage: true })
  })
})

test.describe('F-473 — sidebar brand (mobile 375)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page)
  })

  test('drawer opens to the full wordmark and it decodes', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto('/tableau-de-bord')
    await page.getByTestId('app-shell-hamburger').click()
    await expect(page.getByTestId('app-shell-sidebar')).toHaveAttribute('data-drawer-open', 'true')
    await expectDecoded(page.getByTestId('sidebar-logo-img'))
    await expect(page.getByTestId('sidebar-wordmark')).toHaveAttribute('href', '/tableau-de-bord')
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-473-sidebar-375.png'), fullPage: true })
  })
})
