// F-482 — route-aware pre-paint theme script + client-nav guard + full-reload
// logout. Closes the two gaps F-481 left:
//   (1) .dark leaking onto marketing when an authed dark session client-navigates
//       into a marketing route (no full reload, so no provider unmount strips it).
//   (2) the app full-load entry snap (provider mounted post-hydration).
//
// This spec proves, under an emulated OS dark AND a stale stored theme=dark (as a
// prior authed dark session would leave):
//   1. Every marketing route renders v3 light on full load and on refresh.
//   2. Client-nav from an authed dark shell into marketing (sidebar Pricing ->
//      /tarifs) renders light with no full reload.
//   3. Logout from a dark session lands on a light landing page (full reload).
//   4. App full-load entry applies the stored theme BEFORE paint (no snap): .dark
//      is on <html> at domcontentloaded, before the provider mounts.
//
// Receipts: f-482-<route>-{1440,375}.png. Trace: tests/traces/f-482.zip.

import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { injectAuthToken } from '../helpers/auth-e2e'
import * as path from 'path'
import * as fs from 'fs'

const SCREENSHOT_DIR = path.join(__dirname, '../screenshots')
const TRACE_DIR = path.join(__dirname, '../traces')

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

const V3_LIGHT = 'rgb(234, 239, 243)' // #EAEFF3
const V3_DARK = 'rgb(10, 12, 14)' //     #0A0C0E

async function resolvedCanvas(page: Page) {
  const hex = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--canvas').trim(),
  )
  return page.evaluate((h) => {
    const el = document.createElement('div')
    el.style.color = h
    document.body.appendChild(el)
    const c = getComputedStyle(el).color
    el.remove()
    return c
  }, hex)
}

function hasDarkClass(page: Page) {
  return page.evaluate(() => document.documentElement.classList.contains('dark'))
}

// Seed a stale theme=dark, as a prior authed dark session would have left in
// localStorage. The whole point of F-482 is that this MUST NOT darken marketing.
async function seedStoredDark(page: Page) {
  await page.addInitScript(() => localStorage.setItem('theme', 'dark'))
}

const MARKETING_ROUTES = ['/', '/tarifs', '/connexion', '/inscription'] as const
function slug(route: string) {
  return route === '/' ? 'home' : route.replace(/\//g, '')
}

// 1. Marketing stays v3 light under OS dark + a stale stored theme=dark.
function runMarketing(tag: '1440' | '375', viewport: { width: number; height: number }) {
  test.describe(`F-482 — marketing light under OS dark + stored dark (${tag})`, () => {
    test.use({ viewport, colorScheme: 'dark' })

    for (const route of MARKETING_ROUTES) {
      test(`${route} stays v3 light (load + refresh)`, async ({ page }) => {
        ensureDir(SCREENSHOT_DIR)
        await seedStoredDark(page) // stale dark, no token => logged out

        await page.goto(route)
        expect(await hasDarkClass(page)).toBe(false)
        expect(await resolvedCanvas(page)).toBe(V3_LIGHT)

        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, `f-482-${slug(route)}-${tag}.png`),
          fullPage: true,
        })

        await page.reload()
        expect(await hasDarkClass(page)).toBe(false)
        expect(await resolvedCanvas(page)).toBe(V3_LIGHT)
      })
    }
  })
}
runMarketing('1440', { width: 1440, height: 900 })
runMarketing('375', { width: 375, height: 667 })

// 2. Client-nav from an authed dark shell into marketing renders light (guard).
test.describe('F-482 — client-nav from authed dark into marketing (1440)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })
  // Desktop-rail interaction. The icon rail (hover / pin to expand) is gated on a
  // fine pointer + >=1024px (useSidebarRail RAIL_MEDIA). Under the mobile project
  // the sidebar is the legacy off-canvas drawer with no hover, so this
  // client-nav-from-sidebar case is desktop only; the marketing-light assertions
  // for touch are already covered by the 375 block above.
  test.skip(({ isMobile }) => !!isMobile, 'desktop rail interaction')

  test('sidebar Pricing client-routes to /tarifs and strips .dark (no reload)', async ({ page }) => {
    ensureDir(TRACE_DIR)
    await page.context().tracing.start({ screenshots: true, snapshots: true })

    await injectAuthToken(page)
    await seedStoredDark(page)
    // Pin the rail expanded (F-465 SIDEBAR_MODE_KEY) so the Pricing row is a
    // stable, full-width click target without depending on hover-intent timing.
    await page.addInitScript(() => localStorage.setItem('lm.sidebarMode.v1', 'titles'))

    await page.goto('/tableau-de-bord')
    await expect(page.getByTestId('app-topbar')).toBeVisible()
    await expect.poll(() => hasDarkClass(page)).toBe(true)
    expect(await resolvedCanvas(page)).toBe(V3_DARK)

    // The pinned rail renders expanded; the Pricing row client-routes (no reload).
    await expect(page.getByTestId('app-shell-sidebar')).toHaveAttribute('data-expanded', 'true')
    await page.getByTestId('sidebar-link-tarifs').click()
    await expect(page).toHaveURL(/\/tarifs$/)

    // The MarketingThemeGuard stripped .dark on the marketing route.
    await expect.poll(() => hasDarkClass(page)).toBe(false)
    expect(await resolvedCanvas(page)).toBe(V3_LIGHT)

    await page.context().tracing.stop({ path: path.join(TRACE_DIR, 'f-482.zip') })
  })
})

// 3. Logout from a dark session lands on a light landing page (full reload).
test.describe('F-482 — logout from a dark session lands light (1440)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('signout full-reloads to a light landing page', async ({ page }) => {
    await injectAuthToken(page)
    await seedStoredDark(page)

    await page.goto('/tableau-de-bord')
    await expect(page.getByTestId('app-topbar')).toBeVisible()
    await expect.poll(() => hasDarkClass(page)).toBe(true)

    await page.getByTestId('user-menu-trigger').click()
    await page.getByTestId('user-menu-signout').click()

    await expect(page).toHaveURL(/\/$/)
    await expect.poll(() => hasDarkClass(page)).toBe(false)
    expect(await resolvedCanvas(page)).toBe(V3_LIGHT)
  })
})

// 4. App full-load entry applies the stored theme BEFORE paint (no snap).
test.describe('F-482 — app entry applies dark pre-paint, no snap (1440)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('.dark is on <html> at domcontentloaded, before the provider mounts', async ({ page }) => {
    await injectAuthToken(page)
    await seedStoredDark(page)

    // domcontentloaded fires after the synchronous <head> script ran but before
    // React hydration mounts the provider. If .dark is already set here, it was
    // the pre-paint script, not the post-hydration provider: that is the no-snap
    // guarantee.
    await page.goto('/tableau-de-bord', { waitUntil: 'domcontentloaded' })
    expect(await hasDarkClass(page)).toBe(true)

    // And it stays dark through full hydration and across a reload.
    await expect(page.getByTestId('app-topbar')).toBeVisible()
    await expect.poll(() => hasDarkClass(page)).toBe(true)
    expect(await resolvedCanvas(page)).toBe(V3_DARK)
    await page.reload()
    expect(await hasDarkClass(page)).toBe(true)
  })
})
