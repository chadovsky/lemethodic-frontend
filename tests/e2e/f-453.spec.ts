// F-453 — v3 logged-in shell plumbing (app top bar + dashboard rewire).
// F-225 receipts:
//   f-453-tableau-de-bord-1440.png / -375.png  (top bar + heatmap-free dashboard)
//   f-453-user-menu-1440.png       / -375.png  (user dropdown open)
//   f-453-parametres-1440.png      / -375.png  (de-orphaned via the dropdown)
// Trace: tests/traces/f-453.zip (desktop happy path).

import { test, expect } from '@playwright/test'
import { injectAuthToken } from '../helpers/auth-e2e'
import * as path from 'path'
import * as fs from 'fs'

const SCREENSHOT_DIR = path.join(__dirname, '../screenshots')
const TRACE_DIR = path.join(__dirname, '../traces')
const AUTHED_ROUTE = '/tableau-de-bord'

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

// Override the helper's null-name user so the avatar + dropdown header show a
// real first name and email in the receipts. useVerifyAuth re-hydrates the auth
// store from /api/auth/me, so that route (not just localStorage) must carry the
// named user. Routes registered later win in Playwright.
async function authWithName(page: import('@playwright/test').Page) {
  await injectAuthToken(page)
  const named = { id: 1, email: 'chadi@lemethodic.com', full_name: 'Chadi Bakhay', email_verified: true }
  await page.addInitScript((u) => {
    localStorage.setItem('lemethodic_user', JSON.stringify(u))
  }, named)
  await page.route('**/api/auth/me', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(named) }),
  )
}

test.describe('F-453 — app shell top bar (desktop 1440)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test.beforeEach(async ({ page }) => {
    await authWithName(page)
  })

  test('top bar renders with search, bell, theme toggle, user menu; dashboard has no heatmap', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    ensureDir(TRACE_DIR)
    await page.context().tracing.start({ screenshots: true, snapshots: true })

    await page.goto(AUTHED_ROUTE)

    const topbar = page.getByTestId('app-topbar')
    await expect(topbar).toBeVisible()
    await expect(page.getByTestId('app-topbar-search')).toBeVisible()
    await expect(page.getByTestId('app-topbar-bell')).toBeVisible()
    await expect(topbar.getByTestId('theme-toggle')).toBeVisible()
    await expect(page.getByTestId('user-menu-trigger')).toBeVisible()

    // Heatmap is gone; gated CTA leads the surface.
    expect(await page.getByTestId('dashboard-widget-calendar').count()).toBe(0)
    await expect(page.getByTestId('dashboard-commencer-seance')).toBeVisible()

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-453-tableau-de-bord-1440.png'), fullPage: false })

    // Happy path: open the user dropdown.
    await page.getByTestId('user-menu-trigger').click()
    await expect(page.getByTestId('user-menu-dropdown')).toBeVisible()
    await expect(page.getByTestId('user-menu-header-email')).toHaveText('chadi@lemethodic.com')
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-453-user-menu-1440.png'), fullPage: false })

    // De-orphan check: Settings → /parametres is reachable.
    await page.getByTestId('user-menu-settings').click()
    await expect(page).toHaveURL(/\/parametres$/)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-453-parametres-1440.png'), fullPage: false })

    await page.context().tracing.stop({ path: path.join(TRACE_DIR, 'f-453.zip') })
  })

  test('Subscription item routes to /abonnement', async ({ page }) => {
    await page.goto(AUTHED_ROUTE)
    await page.getByTestId('user-menu-trigger').click()
    await page.getByTestId('user-menu-subscription').click()
    await expect(page).toHaveURL(/\/abonnement$/)
  })

  test('hamburger is hidden on desktop (sidebar is the nav)', async ({ page }) => {
    await page.goto(AUTHED_ROUTE)
    await expect(page.getByTestId('app-shell-hamburger')).toBeHidden()
  })
})

test.describe('F-453 — app shell top bar (mobile 375)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test.beforeEach(async ({ page }) => {
    await authWithName(page)
  })

  test('top bar carries hamburger + theme toggle + user menu; dropdown opens', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto(AUTHED_ROUTE)

    await expect(page.getByTestId('app-topbar')).toBeVisible()
    await expect(page.getByTestId('app-shell-hamburger')).toBeVisible()
    await expect(page.getByTestId('app-topbar').getByTestId('theme-toggle')).toBeVisible()
    await expect(page.getByTestId('dashboard-commencer-seance')).toBeVisible()
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-453-tableau-de-bord-375.png'), fullPage: false })

    await page.getByTestId('user-menu-trigger').click()
    await expect(page.getByTestId('user-menu-dropdown')).toBeVisible()
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-453-user-menu-375.png'), fullPage: false })

    await page.getByTestId('user-menu-settings').click()
    await expect(page).toHaveURL(/\/parametres$/)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-453-parametres-375.png'), fullPage: false })
  })
})
