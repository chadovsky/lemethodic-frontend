// F-450 -- Hotfix: broken nav targets (live 404s).
// Two new bientôt placeholder surfaces resolve instead of 404ing:
//   /coaching  (TopNav + Sidebar link target)
//   /placement (Hero CTA target)
// F-225 captures: f-450-coaching-{1440,375}.png, f-450-placement-{1440,375}.png

import { test, expect } from '@playwright/test'
import * as path from 'path'
import * as fs from 'fs'

const SCREENSHOT_DIR = path.join(__dirname, '../screenshots')
function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

const SURFACES = [
  { route: '/coaching', slug: 'coaching', heading: 'Coaching' },
  { route: '/placement', slug: 'placement', heading: 'Test de positionnement' },
]

// ---------------------------------------------------------------------------
// Desktop 1440
// ---------------------------------------------------------------------------
test.describe('F-450 -- bientôt surfaces (desktop 1440)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  for (const { route, slug, heading } of SURFACES) {
    test(`${route} resolves with a bientôt placeholder`, async ({ page }) => {
      ensureDir(SCREENSHOT_DIR)
      const res = await page.goto(route)
      expect(res?.status()).toBe(200)
      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible()
      await expect(page.getByTestId('bientot-pill')).toBeVisible()
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `f-450-${slug}-1440.png`),
        fullPage: false,
      })
    })
  }
})

// ---------------------------------------------------------------------------
// Mobile 375
// ---------------------------------------------------------------------------
test.describe('F-450 -- bientôt surfaces (mobile 375)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  for (const { route, slug, heading } of SURFACES) {
    test(`${route} renders at 375`, async ({ page }) => {
      ensureDir(SCREENSHOT_DIR)
      const res = await page.goto(route)
      expect(res?.status()).toBe(200)
      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible()
      await page.screenshot({
        path: path.join(SCREENSHOT_DIR, `f-450-${slug}-375.png`),
        fullPage: false,
      })
    })
  }
})
