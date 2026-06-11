// F-447 -- Nav IA content pass.
// Acceptance:
//   TopNav: Library gone; Store -> /librairie; Log in != Start Free href.
//   Sidebar: Library gone; Store + Pricing + Coaching present (revenue section).
//   No routes broken by the relabel.
// F-225 screenshots: f-447-topnav-1440.png, f-447-topnav-375.png,
//                    f-447-sidebar-1440.png, f-447-sidebar-375.png.

import { test, expect } from '@playwright/test'
import { injectAuthToken } from '../helpers/auth-e2e'
import * as path from 'path'
import * as fs from 'fs'

const SCREENSHOT_DIR = path.join(__dirname, '../screenshots')

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

const PUBLIC_ROUTE = '/la-methode'
const AUTHED_ROUTE = '/tableau-de-bord'

// ---------------------------------------------------------------------------
// TopNav (logged-out, desktop)
// ---------------------------------------------------------------------------
test.describe('F-447 -- TopNav content (desktop 1440)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('Store link present in TopNav and routes to /librairie', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto(PUBLIC_ROUTE)
    const nav = page.getByTestId('topnav-desktop')
    const storeLink = nav.getByRole('link', { name: 'Store' })
    await expect(storeLink).toBeVisible()
    await expect(storeLink).toHaveAttribute('href', '/librairie')
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-447-topnav-1440.png'), fullPage: false })
  })

  test('Library link absent from TopNav', async ({ page }) => {
    await page.goto(PUBLIC_ROUTE)
    const nav = page.getByTestId('topnav-desktop')
    expect(await nav.getByRole('link', { name: 'Library' }).count()).toBe(0)
  })

  test('Log in and Start Free have distinct hrefs', async ({ page }) => {
    await page.goto(PUBLIC_ROUTE)
    const nav = page.getByTestId('topnav-desktop')
    const loginHref = await nav.getByRole('link', { name: 'Log in' }).getAttribute('href')
    const startFreeHref = await nav.getByRole('link', { name: 'Start Free' }).getAttribute('href')
    expect(loginHref).toBeTruthy()
    expect(startFreeHref).toBeTruthy()
    expect(loginHref).not.toBe(startFreeHref)
  })

  test('Store routes to /librairie when clicked', async ({ page }) => {
    await page.goto(PUBLIC_ROUTE)
    const nav = page.getByTestId('topnav-desktop')
    await nav.getByRole('link', { name: 'Store' }).click()
    await expect(page).toHaveURL(/\/librairie/)
  })
})

// ---------------------------------------------------------------------------
// TopNav mobile (logged-out, 375)
// ---------------------------------------------------------------------------
test.describe('F-447 -- TopNav content (mobile 375)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('TopNav screenshot captured at 375', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto('/')
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-447-topnav-375.png'), fullPage: false })
  })
})

// ---------------------------------------------------------------------------
// Sidebar (logged-in, desktop)
// ---------------------------------------------------------------------------
test.describe('F-447 -- Sidebar content (desktop 1440)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page)
  })

  test('Store link present in sidebar and routes to /librairie', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto(AUTHED_ROUTE)
    const sidebar = page.getByTestId('app-shell-sidebar')
    await expect(sidebar).toBeVisible()
    const storeLink = sidebar.getByTestId('sidebar-link-librairie')
    await expect(storeLink).toBeVisible()
    await expect(storeLink).toHaveAttribute('href', '/librairie')
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-447-sidebar-1440.png'), fullPage: false })
  })

  test('Library absent from sidebar', async ({ page }) => {
    await page.goto(AUTHED_ROUTE)
    const sidebar = page.getByTestId('app-shell-sidebar')
    expect(await sidebar.getByTestId('sidebar-link-la-bibliotheque').count()).toBe(0)
  })

  test('Pricing present in sidebar and routes to /tarifs', async ({ page }) => {
    await page.goto(AUTHED_ROUTE)
    const sidebar = page.getByTestId('app-shell-sidebar')
    const pricingLink = sidebar.getByTestId('sidebar-link-tarifs')
    await expect(pricingLink).toBeVisible()
    await expect(pricingLink).toHaveAttribute('href', '/tarifs')
  })

  test('Coaching present in sidebar and routes to /coaching', async ({ page }) => {
    await page.goto(AUTHED_ROUTE)
    const sidebar = page.getByTestId('app-shell-sidebar')
    const coachingLink = sidebar.getByTestId('sidebar-link-coaching')
    await expect(coachingLink).toBeVisible()
    await expect(coachingLink).toHaveAttribute('href', '/coaching')
  })

  test('revenue section rendered in sidebar', async ({ page }) => {
    await page.goto(AUTHED_ROUTE)
    await expect(page.getByTestId('sidebar-revenue-section')).toBeVisible()
  })

  test('Store routes to /librairie when clicked', async ({ page }) => {
    await page.goto(AUTHED_ROUTE)
    const sidebar = page.getByTestId('app-shell-sidebar')
    await sidebar.getByTestId('sidebar-link-librairie').click()
    await expect(page).toHaveURL(/\/librairie/)
  })
})

// ---------------------------------------------------------------------------
// Sidebar (logged-in, mobile 375)
// ---------------------------------------------------------------------------
test.describe('F-447 -- Sidebar content (mobile 375)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page)
  })

  test('revenue section visible in sidebar drawer on mobile', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto(AUTHED_ROUTE)
    await page.getByTestId('app-shell-hamburger').click()
    const sidebar = page.getByTestId('app-shell-sidebar')
    await expect(sidebar).toBeVisible()
    await expect(page.getByTestId('sidebar-revenue-section')).toBeVisible()
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-447-sidebar-375.png'), fullPage: false })
  })

  test('Store and Pricing and Coaching links accessible in sidebar drawer', async ({ page }) => {
    await page.goto(AUTHED_ROUTE)
    await page.getByTestId('app-shell-hamburger').click()
    await expect(page.getByTestId('sidebar-link-librairie')).toBeVisible()
    await expect(page.getByTestId('sidebar-link-tarifs')).toBeVisible()
    await expect(page.getByTestId('sidebar-link-coaching')).toBeVisible()
  })
})
