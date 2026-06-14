// F-446 -- Auth-state nav shell split.
// Acceptance: logged-out = TopNav present, sidebar absent.
//             logged-in  = sidebar present, TopNav absent, no double nav.
//             ThemeToggle reachable in sidebar (authenticated).
// F-225 screenshots: f-446-logged-out-1440.png, f-446-logged-in-1440.png,
//                    f-446-logged-out-375.png, f-446-logged-in-375.png.

import { test, expect } from '@playwright/test'
import { injectAuthToken } from '../helpers/auth-e2e'
import * as path from 'path'
import * as fs from 'fs'

const SCREENSHOT_DIR = path.join(__dirname, '../screenshots')

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

// Public product route: TopNav renders here when unauthenticated.
const PUBLIC_ROUTE = '/la-methode'
// Authenticated app route: AppShell + sidebar render here.
const AUTHED_ROUTE = '/tableau-de-bord'

test.describe('F-446 -- logged-out shell (desktop 1440)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('TopNav renders on product route when logged out', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto(PUBLIC_ROUTE)
    await expect(page.getByTestId('topnav-desktop')).toBeVisible()
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-446-logged-out-1440.png'), fullPage: false })
  })

  test('sidebar is absent when logged out', async ({ page }) => {
    await page.goto(PUBLIC_ROUTE)
    // app-shell-sidebar only exists inside AppShell (authenticated routes).
    expect(await page.getByTestId('app-shell-sidebar').count()).toBe(0)
  })

  test('TopNav shows Pricing, Log in, Start Free when logged out', async ({ page }) => {
    await page.goto(PUBLIC_ROUTE)
    const nav = page.getByTestId('topnav-desktop')
    await expect(nav.getByRole('link', { name: 'Pricing' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Log in' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Start Free' })).toBeVisible()
  })

  test('no avatar button in TopNav when logged out', async ({ page }) => {
    await page.goto(PUBLIC_ROUTE)
    expect(await page.getByTestId('topnav-avatar').count()).toBe(0)
  })
})

test.describe('F-446 -- logged-out shell (mobile 375)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('TopNav desktop nav is hidden at 375 (md: guard)', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto(PUBLIC_ROUTE)
    // TopNav desktop nav uses hidden md:flex so it is hidden at 375.
    await expect(page.getByTestId('topnav-desktop')).toBeHidden()
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-446-logged-out-375.png'), fullPage: false })
  })

  test('sidebar absent on mobile when logged out', async ({ page }) => {
    await page.goto(PUBLIC_ROUTE)
    expect(await page.getByTestId('app-shell-sidebar').count()).toBe(0)
  })
})

test.describe('F-446 -- logged-in shell (desktop 1440)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page)
  })

  test('sidebar present and TopNav absent when logged in', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto(AUTHED_ROUTE)
    // Sidebar rendered by AppShell.
    await expect(page.getByTestId('app-shell-sidebar')).toBeVisible()
    // TopNav desktop nav must not be visible (shell split).
    await expect(page.getByTestId('topnav-desktop')).not.toBeVisible()
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-446-logged-in-1440.png'), fullPage: false })
  })

  test('no double nav: only sidebar nav present when logged in', async ({ page }) => {
    await page.goto(AUTHED_ROUTE)
    // Zero count for TopNav avatar button (retired in F-446).
    expect(await page.getByTestId('topnav-avatar').count()).toBe(0)
    // Sidebar is the authenticated shell.
    await expect(page.getByTestId('app-shell-sidebar')).toBeVisible()
  })

  // F-453: ThemeToggle relocated from the sidebar to the app top bar.
  test('ThemeToggle reachable in the app top bar when logged in', async ({ page }) => {
    await page.goto(AUTHED_ROUTE)
    await expect(page.getByTestId('app-shell-sidebar')).toBeVisible()
    const topbar = page.getByTestId('app-topbar')
    await expect(topbar).toBeVisible()
    await expect(topbar.getByTestId('theme-toggle')).toBeVisible()
  })

  test('ThemeToggle click does not throw (basic interaction)', async ({ page }) => {
    await page.goto(AUTHED_ROUTE)
    const toggleBtn = page.getByTestId('theme-toggle')
    await expect(toggleBtn).toBeVisible()
    await toggleBtn.click()
    // No crash — page still shows sidebar.
    await expect(page.getByTestId('app-shell-sidebar')).toBeVisible()
  })
})

test.describe('F-446 -- logged-in shell (mobile 375)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page)
  })

  test('app top bar renders on mobile when logged in, no TopNav', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto(AUTHED_ROUTE)
    // AppShell renders the app top bar (.app-topbar) carrying the hamburger.
    await expect(page.locator('.app-topbar')).toBeVisible()
    // TopNav desktop nav is absent (hidden md:flex + token guard).
    await expect(page.getByTestId('topnav-desktop')).not.toBeVisible()
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-446-logged-in-375.png'), fullPage: false })
  })

  test('hamburger opens sidebar drawer on mobile when logged in', async ({ page }) => {
    await page.goto(AUTHED_ROUTE)
    await page.getByTestId('app-shell-hamburger').click()
    await expect(page.getByTestId('app-shell-sidebar')).toBeVisible()
  })

  // F-453: ThemeToggle lives in the app top bar (visible at all widths),
  // no longer inside the sidebar drawer.
  test('ThemeToggle visible in the app top bar on mobile', async ({ page }) => {
    await page.goto(AUTHED_ROUTE)
    await expect(page.getByTestId('app-topbar').getByTestId('theme-toggle')).toBeVisible()
  })
})
