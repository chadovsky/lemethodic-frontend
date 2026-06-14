// F-455 — v3 shell chrome paint (frosted sidebar + top bar).
// F-225 receipts (painted shell, sidebar + top bar + open dropdown):
//   f-455-tableau-de-bord-1440.png      / -375.png        (light)
//   f-455-tableau-de-bord-dark-1440.png / -dark-375.png   (dark)
//   f-455-user-menu-1440.png            / -375.png        (light, dropdown open)
//   f-455-user-menu-dark-1440.png       / -dark-375.png   (dark, dropdown open)
// Trace: tests/traces/f-455.zip (desktop happy path).

import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { injectAuthToken } from '../helpers/auth-e2e'
import * as path from 'path'
import * as fs from 'fs'

const SCREENSHOT_DIR = path.join(__dirname, '../screenshots')
const TRACE_DIR = path.join(__dirname, '../traces')
const AUTHED_ROUTE = '/tableau-de-bord'

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

// Named user so the avatar + dropdown header show real copy in the receipts
// (mirrors the F-453 helper). Optionally forces the next-themes class to dark.
async function authWithName(page: Page, theme: 'light' | 'dark' = 'light') {
  await injectAuthToken(page)
  const named = { id: 1, email: 'chadi@lemethodic.com', full_name: 'Chadi Bakhay', email_verified: true }
  await page.addInitScript(
    ({ u, t }) => {
      localStorage.setItem('lemethodic_user', JSON.stringify(u))
      localStorage.setItem('theme', t)
    },
    { u: named, t: theme },
  )
  await page.route('**/api/auth/me', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(named) }),
  )
}

test.describe('F-455 — frosted shell (desktop 1440, light)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test.beforeEach(async ({ page }) => {
    await authWithName(page, 'light')
  })

  test('frosted sidebar + top bar paint; active pill + dropdown', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    ensureDir(TRACE_DIR)
    await page.context().tracing.start({ screenshots: true, snapshots: true })

    await page.goto(AUTHED_ROUTE)

    // Chrome present + IA preserved.
    await expect(page.getByTestId('app-shell-sidebar')).toBeVisible()
    await expect(page.getByTestId('sidebar-wordmark')).toContainText('Le Méthodic')
    await expect(page.getByTestId('app-topbar')).toBeVisible()
    await expect(page.getByTestId('app-topbar-title')).toHaveText('Tableau de bord')
    await expect(page.getByTestId('app-topbar-lang')).toBeVisible()
    await expect(page.getByTestId('app-topbar-bell')).toBeVisible()

    // Active pill on the current route; legacy left-tab gone.
    await expect(page.getByTestId('sidebar-link-tableau-de-bord')).toHaveAttribute('data-active', 'true')
    await expect(page.getByTestId('sidebar-active-tab')).toHaveCount(0)

    // Logout deduped out of the sidebar.
    await expect(page.getByTestId('sidebar-signout')).toHaveCount(0)

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-455-tableau-de-bord-1440.png'), fullPage: false })

    // Happy path: open the user dropdown (logout lives here).
    await page.getByTestId('user-menu-trigger').click()
    await expect(page.getByTestId('user-menu-dropdown')).toBeVisible()
    await expect(page.getByTestId('user-menu-signout')).toBeVisible()
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-455-user-menu-1440.png'), fullPage: false })

    await page.context().tracing.stop({ path: path.join(TRACE_DIR, 'f-455.zip') })
  })
})

test.describe('F-455 — frosted shell (desktop 1440, dark)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test.beforeEach(async ({ page }) => {
    await authWithName(page, 'dark')
  })

  test('frosted shell renders in dark mode', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto(AUTHED_ROUTE)
    await expect(page.locator('html')).toHaveClass(/dark/)
    await expect(page.getByTestId('app-topbar')).toBeVisible()
    await expect(page.getByTestId('app-shell-sidebar')).toBeVisible()
    await expect(page.getByTestId('user-menu-trigger')).toBeVisible()
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-455-tableau-de-bord-dark-1440.png'), fullPage: false })

    await page.getByTestId('user-menu-trigger').click()
    await expect(page.getByTestId('user-menu-dropdown')).toBeVisible()
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-455-user-menu-dark-1440.png'), fullPage: false })
  })
})

test.describe('F-455 — frosted shell (mobile 375, light)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test.beforeEach(async ({ page }) => {
    await authWithName(page, 'light')
  })

  test('shell + drawer + dropdown on mobile', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto(AUTHED_ROUTE)
    await expect(page.getByTestId('app-topbar')).toBeVisible()
    await expect(page.getByTestId('app-shell-hamburger')).toBeVisible()
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-455-tableau-de-bord-375.png'), fullPage: false })

    await page.getByTestId('user-menu-trigger').click()
    await expect(page.getByTestId('user-menu-dropdown')).toBeVisible()
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-455-user-menu-375.png'), fullPage: false })
  })
})

test.describe('F-455 — frosted shell (mobile 375, dark)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test.beforeEach(async ({ page }) => {
    await authWithName(page, 'dark')
  })

  test('shell renders in dark mode on mobile', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto(AUTHED_ROUTE)
    await expect(page.locator('html')).toHaveClass(/dark/)
    await expect(page.getByTestId('app-topbar')).toBeVisible()
    await expect(page.getByTestId('app-shell-hamburger')).toBeVisible()
    await expect(page.getByTestId('user-menu-trigger')).toBeVisible()
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-455-tableau-de-bord-dark-375.png'), fullPage: false })

    await page.getByTestId('user-menu-trigger').click()
    await expect(page.getByTestId('user-menu-dropdown')).toBeVisible()
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-455-user-menu-dark-375.png'), fullPage: false })
  })
})
