// F-483 — La Méthode 5-couche isometric 3D stack visualizer (/la-methode).
// Receipts:
//   f-483-la-methode-1440.png  (isometric 3D stack, v3 light, desktop)
//   f-483-la-methode-375.png   (flat upright fallback, mobile)
// Trace: tests/traces/f-483.zip (desktop happy path).
//
// Asserts the launch contract: five How-to headlines present on /la-methode, one
// per block; NO couche-name eyebrows; each desktop headline sits on a single
// line with no clip (the iso illusion depends on it); no horizontal overflow;
// mobile flat fallback intact.

import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import * as path from 'path'
import * as fs from 'fs'

const SCREENSHOT_DIR = path.join(__dirname, '../screenshots')
const TRACE_DIR = path.join(__dirname, '../traces')

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

const HEADLINES = [
  'How to say what you actually mean',
  'How to organize your ideas in French',
  'How to build sentences that hold up',
  'How to dodge the English traps',
  'How to sound native, not assembled',
]

// Keep the lessons fetch deterministic; the visualizer itself is static.
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
  const headlines = page.getByTestId('couche-stack-headline')
  await expect(headlines).toHaveCount(5)
  await expect(headlines).toHaveText(HEADLINES)
  // The eyebrows were removed: no couche names on the tiles.
  await expect(page.getByTestId('couche-stack-eyebrow')).toHaveCount(0)
  await expect(page.getByTestId('couche-stack-detail')).toHaveCount(0)
}

async function expectNoOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(1)
}

test.describe('F-483 — couche stack (desktop 1440, v3 light)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })
  test.skip(({ isMobile }) => !!isMobile, 'desktop iso geometry')

  test('renders the five headlines, one line each, no clip, no overflow', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    ensureDir(TRACE_DIR)
    await page.context().tracing.start({ screenshots: true, snapshots: true })

    await page.goto('/la-methode')
    await expectContent(page)

    // Each headline fits on one line and is not clipped: with white-space:nowrap,
    // scrollWidth > clientWidth would mean the text overflows / is cut off.
    const counts = await page.getByTestId('couche-stack-headline').evaluateAll((els) =>
      els.map((el) => ({ scroll: el.scrollWidth, client: el.clientWidth })),
    )
    expect(counts).toHaveLength(5)
    for (const { scroll, client } of counts) {
      expect(scroll).toBeLessThanOrEqual(client + 1)
    }

    await expectNoOverflow(page)
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'f-483-la-methode-1440.png'),
      fullPage: true,
    })

    await page.context().tracing.stop({ path: path.join(TRACE_DIR, 'f-483.zip') })
  })
})

test.describe('F-483 — couche stack (mobile 375, flat fallback)', () => {
  test.use({ viewport: { width: 375, height: 667 } })
  test.skip(({ isMobile }) => !isMobile, 'mobile flat fallback')

  test('shows the five headlines upright, no eyebrows, no horizontal scroll', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto('/la-methode')
    await expectContent(page)

    const headlines = page.getByTestId('couche-stack-headline')
    for (let i = 0; i < 5; i++) {
      await expect(headlines.nth(i)).toBeVisible()
    }

    await expectNoOverflow(page)
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'f-483-la-methode-375.png'),
      fullPage: true,
    })
  })
})
