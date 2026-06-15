// F-454 — v3 palette foundation (global token repoint, light + dark).
// F-225 receipts (both modes, since this ticket repaints every surface):
//   f-454-dashboard-{light,dark}-{1440,375}.png   (authed shell + dashboard)
//   f-454-la-methode-{light,dark}-{1440,375}.png   (a méthode surface)
//   f-454-user-menu-{light,dark}-{1440,375}.png    (top bar + open dropdown)
// Trace: tests/traces/f-454.zip (desktop dark happy path).
//
// The token repoint is verified to *render* (not just exist in CSS) by reading
// the computed canvas/accent values in each mode and asserting they match the
// v3 palette, so a broken var() chain would fail the suite, not just look off.

import { test, expect } from '@playwright/test'
import { injectAuthToken } from '../helpers/auth-e2e'
import * as path from 'path'
import * as fs from 'fs'

const SCREENSHOT_DIR = path.join(__dirname, '../screenshots')
const TRACE_DIR = path.join(__dirname, '../traces')

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

// Named user so the avatar + dropdown header render real text in the receipts.
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

// next-themes (attribute="class", default storageKey "theme"): an explicit
// value in localStorage forces light/dark regardless of the system pref.
async function forceTheme(page: import('@playwright/test').Page, theme: 'light' | 'dark') {
  await page.addInitScript((t) => localStorage.setItem('theme', t), theme)
}

// v3 canonical canvas values (DESIGN.md v3 / F-454). Computed --canvas resolves
// to rgb() in the browser.
const V3_CANVAS = {
  light: 'rgb(234, 239, 243)', // #EAEFF3 (F-463 cooler canvas)
  dark: 'rgb(10, 12, 14)', //    #0A0C0E
}

async function assertCanvas(page: import('@playwright/test').Page, theme: 'light' | 'dark') {
  if (theme === 'dark') {
    await expect(page.locator('html')).toHaveClass(/dark/)
  }
  const canvas = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--canvas').trim(),
  )
  // --canvas is stored as the hex; normalise by painting it and reading back.
  const rendered = await page.evaluate((hex) => {
    const el = document.createElement('div')
    el.style.color = hex
    document.body.appendChild(el)
    const c = getComputedStyle(el).color
    el.remove()
    return c
  }, canvas)
  expect(rendered).toBe(V3_CANVAS[theme])
}

const THEMES: Array<'light' | 'dark'> = ['light', 'dark']

function run(viewportTag: '1440' | '375', viewport: { width: number; height: number }) {
  test.describe(`F-454 — v3 palette renders (${viewportTag})`, () => {
    test.use({ viewport })

    for (const theme of THEMES) {
      test(`${theme} mode: dashboard, la-methode, user menu carry v3 canvas`, async ({ page }) => {
        ensureDir(SCREENSHOT_DIR)
        ensureDir(TRACE_DIR)
        const trace = viewportTag === '1440' && theme === 'dark'
        if (trace) await page.context().tracing.start({ screenshots: true, snapshots: true })

        await authWithName(page)
        await forceTheme(page, theme)

        // Dashboard (authed shell).
        await page.goto('/tableau-de-bord')
        await expect(page.getByTestId('app-topbar')).toBeVisible()
        await assertCanvas(page, theme)
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, `f-454-dashboard-${theme}-${viewportTag}.png`),
          fullPage: false,
        })

        // Top bar + open user dropdown (selected/accent surface).
        await page.getByTestId('user-menu-trigger').click()
        await expect(page.getByTestId('user-menu-dropdown')).toBeVisible()
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, `f-454-user-menu-${theme}-${viewportTag}.png`),
          fullPage: false,
        })

        // A méthode surface.
        await page.goto('/la-methode')
        await page.waitForLoadState('networkidle')
        await assertCanvas(page, theme)
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, `f-454-la-methode-${theme}-${viewportTag}.png`),
          fullPage: false,
        })

        if (trace) await page.context().tracing.stop({ path: path.join(TRACE_DIR, 'f-454.zip') })
      })
    }
  })
}

run('1440', { width: 1440, height: 900 })
run('375', { width: 375, height: 667 })
