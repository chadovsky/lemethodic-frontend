// F-483 — La Méthode 5-couche skewed-stack visualizer (/la-methode).
// Receipts:
//   f-483-la-methode-1440.png  (skewed stack, v3 light, desktop)
//   f-483-la-methode-375.png   (flat stack, details open, mobile)
// Trace: tests/traces/f-483.zip (desktop happy path).
//
// Asserts the launch contract: the five French couche eyebrows + the five
// How-to headlines are present on /la-methode; the detail line of each band is
// reachable by hover AND by keyboard focus on desktop; on touch every detail
// is visible without hover; no horizontal overflow.

import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import * as path from 'path'
import * as fs from 'fs'

const SCREENSHOT_DIR = path.join(__dirname, '../screenshots')
const TRACE_DIR = path.join(__dirname, '../traces')

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

const EYEBROWS = [
  'Le Propos',
  'Le Plan',
  'La Construction',
  'Les Pièges Anglais',
  'La Musique',
]

const HEADLINES = [
  'How to say what you actually mean',
  'How to organize your ideas in French',
  'How to build sentences that hold up',
  'How to dodge the English traps',
  'How to sound native, not assembled',
]

// Keep the lessons fetch deterministic so the page settles fast; the visualizer
// itself is static and renders regardless of this response.
test.beforeEach(async ({ page }) => {
  await page.route('**/api/ecole/lessons', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ lessons: [] }),
    })
  })
})

async function expectContent(page: Page) {
  await expect(page.getByTestId('couche-stack')).toBeVisible()
  const eyebrows = page.getByTestId('couche-stack-eyebrow')
  const headlines = page.getByTestId('couche-stack-headline')
  await expect(eyebrows).toHaveCount(5)
  await expect(headlines).toHaveCount(5)
  await expect(eyebrows).toHaveText(EYEBROWS)
  await expect(headlines).toHaveText(HEADLINES)
}

async function expectNoOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(1)
}

// Tab through the page chrome until the first couche band holds focus. Keyboard
// navigation (not programmatic .focus()) is what triggers :focus-visible, which
// is the selector the detail reveal hangs off.
async function tabToFirstLayer(page: Page) {
  const first = page.getByTestId('couche-stack-layer').first()
  for (let i = 0; i < 60; i++) {
    if (await first.evaluate((el) => el === document.activeElement)) return true
    await page.keyboard.press('Tab')
  }
  return false
}

test.describe('F-483 — couche stack (desktop 1440, v3 light)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })
  test.skip(({ isMobile }) => !!isMobile, 'desktop hover / keyboard interaction')

  test('renders the five eyebrows + headlines and reveals detail on hover', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    ensureDir(TRACE_DIR)
    await page.context().tracing.start({ screenshots: true, snapshots: true })

    await page.goto('/la-methode')
    await expectContent(page)

    // Detail of the first band is collapsed (height 0) until hover.
    const firstLayer = page.getByTestId('couche-stack-layer').first()
    const firstDetail = firstLayer.getByTestId('couche-stack-detail')
    await expect(firstDetail).toBeHidden()

    await firstLayer.hover()
    await expect(firstDetail).toBeVisible()

    await expectNoOverflow(page)
    // Let the 0.3s lift/reveal settle so the receipt is not caught mid-transition.
    await page.waitForTimeout(450)
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'f-483-la-methode-1440.png'),
      fullPage: true,
    })

    await page.context().tracing.stop({ path: path.join(TRACE_DIR, 'f-483.zip') })
  })

  test('reveals detail on keyboard focus', async ({ page }) => {
    await page.goto('/la-methode')
    await expectContent(page)

    const firstLayer = page.getByTestId('couche-stack-layer').first()
    await expect(firstLayer.getByTestId('couche-stack-detail')).toBeHidden()

    expect(await tabToFirstLayer(page)).toBe(true)
    await expect(firstLayer.getByTestId('couche-stack-detail')).toBeVisible()
  })
})

test.describe('F-483 — couche stack (mobile 375, touch)', () => {
  test.use({ viewport: { width: 375, height: 667 } })
  test.skip(({ isMobile }) => !isMobile, 'touch: details open without hover')

  test('shows the five bands with every detail visible, no horizontal scroll', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto('/la-methode')
    await expectContent(page)

    // No hover on touch: every detail is visible up front.
    const details = page.getByTestId('couche-stack-detail')
    await expect(details).toHaveCount(5)
    for (let i = 0; i < 5; i++) {
      await expect(details.nth(i)).toBeVisible()
    }

    await expectNoOverflow(page)
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'f-483-la-methode-375.png'),
      fullPage: true,
    })
  })
})
