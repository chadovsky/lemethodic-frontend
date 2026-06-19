// F-480 — /inscription is a headerless focused auth surface, consistent with
// /connexion. Two fixes proven here:
//   1. The pill nav (TopNav) no longer renders on /inscription — so the page no
//      longer shows the nav's brand logo AND the signup card's wordmark (two
//      logos). Only the card logo remains.
//   2. The signup card carries the real brand wordmark asset (same treatment as
//      the /connexion card), not the old boxed <Wordmark>.
// Receipts:
//   f-480-inscription-1440.png / f-480-inscription-375.png
// Trace: tests/traces/f-480.zip (/inscription → "Sign in" → /connexion, the
// happy path proving the two auth surfaces are consistent).
//
// Gate (per dispatch): the card logo must DECODE (complete && naturalWidth > 0),
// not merely have a src — a 404'd <img> still has a src (F-461 lesson). And the
// pill nav testids must be absent (count 0) so there is exactly one logo.

import { test, expect } from '@playwright/test'
import type { Locator } from '@playwright/test'
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

test.describe('F-480 — headerless /inscription, single card logo (desktop 1440)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('no pill nav; exactly one (decoded) card logo', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto('/inscription')
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible()

    // Headerless: the floating pill nav must not render here (like /connexion).
    await expect(page.getByTestId('topnav-desktop')).toHaveCount(0)
    await expect(page.getByTestId('topnav-mobile')).toHaveCount(0)
    // ...so the nav's logo is gone — leaving exactly one logo on the page.
    await expect(page.getByTestId('topnav-logo-img')).toHaveCount(0)
    await expect(page.getByTestId('inscription-logo')).toHaveCount(1)

    const logo = page.getByTestId('inscription-logo')
    await expectDecoded(logo)
    // Same treatment as the /connexion card: ~200px wide wordmark asset.
    const box = await logo.boundingBox()
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(180)

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-480-inscription-1440.png'), fullPage: true })
  })

  test('the two auth surfaces are consistent (happy path)', async ({ page }) => {
    ensureDir(TRACE_DIR)
    await page.context().tracing.start({ screenshots: true, snapshots: true })
    await page.goto('/inscription')
    await expectDecoded(page.getByTestId('inscription-logo'))
    // "Sign in" crosses to /connexion — also headerless, also a single card logo.
    await page.getByRole('link', { name: /sign in/i }).click()
    await expect(page).toHaveURL(/\/connexion/)
    await expect(page.getByTestId('topnav-desktop')).toHaveCount(0)
    await expectDecoded(page.getByTestId('connexion-logo'))
    await page.context().tracing.stop({ path: path.join(TRACE_DIR, 'f-480.zip') })
  })
})

test.describe('F-480 — headerless /inscription, single card logo (mobile 375)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('card logo decodes, no pill header, no horizontal overflow', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto('/inscription')
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible()
    await expect(page.getByTestId('topnav-mobile')).toHaveCount(0)
    await expectDecoded(page.getByTestId('inscription-logo'))
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )
    expect(overflow).toBeLessThanOrEqual(0)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-480-inscription-375.png'), fullPage: true })
  })
})
