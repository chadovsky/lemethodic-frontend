// F-481 — marketing / logged-out surfaces are locked to the v3 LIGHT palette,
// ignore the OS dark preference, and never flash dark before paint.
//
// Mechanism (Option 1): the next-themes provider was relocated from the root
// layout into AppShell (the authed-only chrome). Logged-out and marketing routes
// therefore mount no theme provider and no theme script at all, so the .dark
// class is never applied and the page renders v3 light by construction.
//
// This spec emulates an OS set to dark (colorScheme: 'dark') and proves:
//   1. Every marketing route renders LIGHT — html carries no .dark class and the
//      computed --canvas resolves to the v3 light value (not the dark token), on
//      first load AND after a refresh (deterministic, no FOUC).
//   2. Authed dark mode still works after the relocation and persists across a
//      full reload — the provider move did not kill it.
//
// Receipts: f-481-<route>-{1440,375}.png. Trace: tests/traces/f-481.zip.

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

// v3 canonical canvas values (DESIGN.md v3 / F-454 / F-463 cooler canvas).
// --canvas is stored as a hex, so we paint it and read the rendered rgb() back.
const V3_CANVAS_LIGHT = 'rgb(234, 239, 243)' // #EAEFF3
const V3_CANVAS_DARK = 'rgb(10, 12, 14)' //     #0A0C0E

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

// Exact token match on the html classList (a hashed next/font variable class
// could contain a "dark" substring, so a regex on the class string is unsafe).
async function expectDarkClass(page: Page, present: boolean) {
  await expect
    .poll(() => page.evaluate(() => document.documentElement.classList.contains('dark')))
    .toBe(present)
}

const MARKETING_ROUTES = ['/', '/tarifs', '/connexion', '/inscription'] as const
function slug(route: string) {
  return route === '/' ? 'home' : route.replace(/\//g, '')
}

function run(tag: '1440' | '375', viewport: { width: number; height: number }) {
  test.describe(`F-481 — marketing locked to v3 light under OS dark (${tag})`, () => {
    test.use({ viewport, colorScheme: 'dark' })

    for (const route of MARKETING_ROUTES) {
      test(`${route} renders v3 light and ignores the OS dark preference`, async ({ page }) => {
        ensureDir(SCREENSHOT_DIR)

        await page.goto(route)
        // No provider on marketing means the .dark class is never applied...
        await expectDarkClass(page, false)
        // ...and the v3 LIGHT canvas is what actually resolves, not the dark token.
        expect(await resolvedCanvas(page)).toBe(V3_CANVAS_LIGHT)

        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, `f-481-${slug(route)}-${tag}.png`),
          fullPage: true,
        })

        // Refresh: still light, still no dark class (deterministic, no FOUC).
        await page.reload()
        await expectDarkClass(page, false)
        expect(await resolvedCanvas(page)).toBe(V3_CANVAS_LIGHT)
      })
    }
  })
}

run('1440', { width: 1440, height: 900 })
run('375', { width: 375, height: 667 })

// The provider relocation must NOT have killed authed dark mode.
test.describe('F-481 — authed dark mode survives the provider relocation (1440)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('forced dark applies in the app shell and persists across a full reload', async ({ page }) => {
    ensureDir(TRACE_DIR)
    await page.context().tracing.start({ screenshots: true, snapshots: true })

    await injectAuthToken(page)
    // next-themes default storageKey is "theme" (see F-454).
    await page.addInitScript(() => localStorage.setItem('theme', 'dark'))

    await page.goto('/tableau-de-bord')
    await expect(page.getByTestId('app-topbar')).toBeVisible()
    await expectDarkClass(page, true)
    expect(await resolvedCanvas(page)).toBe(V3_CANVAS_DARK)

    // Persists across a full reload (localStorage-backed).
    await page.reload()
    await expect(page.getByTestId('app-topbar')).toBeVisible()
    await expectDarkClass(page, true)

    await page.context().tracing.stop({ path: path.join(TRACE_DIR, 'f-481.zip') })
  })
})
