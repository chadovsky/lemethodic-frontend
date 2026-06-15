// F-454 extension — sweep of v2 colors in rgba()/hsl() form (the hex grep missed
// these). The dead navy/vermillion/green rgba tints were routed through v3 tokens
// (semantic consts → token, themed tints → color-mix of the role token at the same
// alpha). These are the surfaces that visibly shifted, recaptured per F-225:
//   f-454ext-molds-{light,dark}-{1440,375}.png    (lesson molds: answer/piège/chip tints)
//   f-454ext-l-examen-{light,dark}-{1440,375}.png  (secondary text + hairline borders)
// Trace: tests/traces/f-454-ext.zip (desktop dark happy path).

import { test, expect } from '@playwright/test'
import { injectAuthToken } from '../helpers/auth-e2e'
import * as path from 'path'
import * as fs from 'fs'

const SCREENSHOT_DIR = path.join(__dirname, '../screenshots')
const TRACE_DIR = path.join(__dirname, '../traces')

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

async function forceTheme(page: import('@playwright/test').Page, theme: 'light' | 'dark') {
  await page.addInitScript((t) => localStorage.setItem('theme', t), theme)
}

const V3_CANVAS = { light: 'rgb(234, 239, 243)', dark: 'rgb(10, 12, 14)' } // light #EAEFF3 (F-463)

async function assertCanvas(page: import('@playwright/test').Page, theme: 'light' | 'dark') {
  if (theme === 'dark') await expect(page.locator('html')).toHaveClass(/dark/)
  const canvas = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue('--canvas').trim(),
  )
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

function run(tag: '1440' | '375', viewport: { width: number; height: number }) {
  test.describe(`F-454 ext — rgba/hsl sweep renders (${tag})`, () => {
    test.use({ viewport })

    for (const theme of THEMES) {
      test(`${theme} mode: molds + l-examen carry v3 tokens`, async ({ page }) => {
        ensureDir(SCREENSHOT_DIR)
        ensureDir(TRACE_DIR)
        const trace = tag === '1440' && theme === 'dark'
        if (trace) await page.context().tracing.start({ screenshots: true, snapshots: true })

        await injectAuthToken(page)
        await forceTheme(page, theme)

        // Lesson molds showcase — Regle piège (accent tint), Tache chips
        // (dominant/accent tints), ActeDeParole (dominant tint), Activite cards.
        await page.goto('/dev/molds')
        await page.waitForLoadState('networkidle')
        await assertCanvas(page, theme)
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, `f-454ext-molds-${theme}-${tag}.png`),
          fullPage: true,
        })

        // L'Examen hub — INK_SOFT (secondary text) + RULE (hairline) consts,
        // formerly dead-navy rgba, now v3 tokens.
        await page.goto('/l-examen')
        await page.waitForLoadState('networkidle')
        await assertCanvas(page, theme)
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, `f-454ext-l-examen-${theme}-${tag}.png`),
          fullPage: false,
        })

        if (trace) await page.context().tracing.stop({ path: path.join(TRACE_DIR, 'f-454-ext.zip') })
      })
    }
  })
}

run('1440', { width: 1440, height: 900 })
run('375', { width: 375, height: 667 })
