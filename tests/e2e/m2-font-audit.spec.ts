import { test } from '@playwright/test'
import { injectAuthToken } from '../helpers/auth-e2e'
import * as fs from 'fs'
import * as path from 'path'

const AUDIT_DIR = path.join(process.cwd(), 'docs/audit-screenshots/m2-fonts')

test.beforeAll(() => {
  fs.mkdirSync(AUDIT_DIR, { recursive: true })
})

const SURFACES = [
  { route: '/', slug: 'home' },
  { route: '/dashboard', slug: 'dashboard', auth: true },
  { route: '/cours/methode-tcf-canada', slug: 'la-methode', auth: true },
  { route: '/la-bibliotheque', slug: 'la-bibliotheque', auth: true },
  { route: '/l-examen', slug: 'l-examen', auth: true },
  { route: '/cours/methode-tcf-canada/lecon-1', slug: 'lesson-detail', auth: true },
]

for (const surface of SURFACES) {
  test(`m2-fonts capture ${surface.slug}`, async ({ page }) => {
    if (surface.auth) {
      await injectAuthToken(page)
      await page.route('**/api/**', (route) => {
        route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
      })
    }

    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(surface.route, { waitUntil: 'networkidle', timeout: 15000 })
    await page.screenshot({
      path: path.join(AUDIT_DIR, `m2-fonts-${surface.slug}-1440.png`),
      fullPage: true,
    })

    await page.setViewportSize({ width: 375, height: 812 })
    await page.screenshot({
      path: path.join(AUDIT_DIR, `m2-fonts-${surface.slug}-375.png`),
      fullPage: true,
    })
  })
}
