// F-483 — La Méthode 5-couche visualizer (/la-methode), SVG isometric block.
// Receipts:
//   f-483-la-methode-1440.png  (sky SVG isometric block, desktop)
//   f-483-la-methode-375.png   (same SVG scaled, mobile)
// Trace: tests/traces/f-483.zip (desktop happy path).
//
// Asserts the launch contract: the component is visible; the five couche labels
// (eyebrows) and their five How-to phrases render in order (as SVG <text>); no
// horizontal overflow at either width.

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
  // Five couche labels (eyebrows) render in order.
  const eyebrows = page.getByTestId('couche-stack-eyebrow')
  await expect(eyebrows).toHaveCount(5)
  await expect(eyebrows).toHaveText(EYEBROWS)
  // Five How-to phrases render in order.
  const headlines = page.getByTestId('couche-stack-headline')
  await expect(headlines).toHaveCount(5)
  await expect(headlines).toHaveText(HEADLINES)
}

async function expectNoOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  expect(overflow).toBeLessThanOrEqual(1)
}

test.describe('F-483 — couche stack (desktop 1440, sky)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })
  test.skip(({ isMobile }) => !!isMobile, 'desktop iso geometry')

  test('renders the five labels + phrases, visible, no overflow', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    ensureDir(TRACE_DIR)
    await page.context().tracing.start({ screenshots: true, snapshots: true })

    await page.goto('/la-methode')
    await expectContent(page)
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

  test('renders the five labels + phrases upright, no horizontal scroll', async ({ page }) => {
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
