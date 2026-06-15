// F-466 — widen the dashboard content column to 1536 (dashboard-only).
// F-225 receipt: f-466-tableau-de-bord-1920.png (wide desktop).
//
// AppShell caps content at a shared 1200px reading width for every authed route;
// F-466 overrides only /tableau-de-bord to 1536 so the data-dense dashboard gets
// room on wide monitors. This spec proves the dashboard uses the wide cap while
// another authed route keeps 1200 -- i.e. the override is per-route.
//
// F-469 note: /carte joined the wide-column set (the sea-world fills up to 1536),
// so the "stays 1200" control here is /parametres, which keeps the shared width.

import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { injectAuthToken } from '../helpers/auth-e2e'
import * as path from 'path'
import * as fs from 'fs'

const SCREENSHOT_DIR = path.join(__dirname, '../screenshots')

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

async function setup(page: Page) {
  await injectAuthToken(page)
  await page.addInitScript(() => {
    localStorage.setItem('lm.targetProfile.v1', JSON.stringify({ level: 'B1' }))
    localStorage.setItem('lm.journeyProgress.v1', JSON.stringify({}))
  })
  await page.route('**/api/users/me/activity-calendar*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ current_streak: 4, longest_streak: 9, today_count: 30, today_target: 30, days: [] }),
    }),
  )
}

test.describe('F-466 — dashboard wide column (desktop 1920×1080)', () => {
  test.use({ viewport: { width: 1920, height: 1080 } })

  test.beforeEach(async ({ page }) => {
    await setup(page)
  })

  test('dashboard uses the 1536 content cap; another authed route keeps 1200', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)

    await page.goto('/tableau-de-bord')
    await expect(page.getByTestId('dashboard-zone-main')).toBeVisible()
    const dashWidth = await page
      .getByTestId('app-shell-content')
      .evaluate((el) => el.getBoundingClientRect().width)
    // Pin the actual cap: maxWidth 1536 at a 1920 viewport (rail + padding leave
    // ~1792 available, so the content div hits its 1536 cap exactly). >1450
    // distinguishes 1536 from the prior 1440; the upper bound is the cap + a
    // sub-pixel gutter.
    expect(dashWidth).toBeGreaterThan(1450)
    expect(dashWidth).toBeLessThanOrEqual(1537)

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-466-tableau-de-bord-1920.png'), fullPage: true })

    // A different authed route (/parametres) keeps the shared 1200 reading width
    // (/carte is now in the wide-column set per F-469, so it is no longer the
    // narrow control).
    await page.goto('/parametres')
    await expect(page.getByTestId('app-shell-content')).toBeVisible()
    const narrowWidth = await page
      .getByTestId('app-shell-content')
      .evaluate((el) => el.getBoundingClientRect().width)
    expect(narrowWidth).toBeLessThanOrEqual(1201)
  })
})
