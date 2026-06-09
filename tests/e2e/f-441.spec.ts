// F-441 -- TopNav + SITEMAP rebuild to locked IA.
// Verifies: English nav labels, Exams dropdown, bientôt chips, auth-conditional right side.

import { test, expect } from '@playwright/test'
import { injectAuthToken } from '../helpers/auth-e2e'
import * as path from 'path'
import * as fs from 'fs'

const SCREENSHOT_DIR = path.join(__dirname, '../screenshots')
const ROUTE = '/la-methode'

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

test.describe('F-441 -- TopNav IA (unauthenticated)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('nav shows Vocabulary, Exams, Library on desktop (1440)', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto(ROUTE)
    const nav = page.getByRole('navigation', { name: 'Primary' })
    await expect(nav).toBeVisible()
    await expect(nav.getByText('Vocabulary')).toBeVisible()
    await expect(nav.getByText('Exams')).toBeVisible()
    await expect(nav.getByText('Library')).toBeVisible()
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-441-la-methode-1440.png'), fullPage: false })
  })

  test('bientôt chips visible for Real French and AI Tutor', async ({ page }) => {
    await page.goto(ROUTE)
    const nav = page.getByRole('navigation', { name: 'Primary' })
    await expect(nav.getByText('Real French')).toBeVisible()
    await expect(nav.getByText('AI Tutor')).toBeVisible()
    // Two bientôt chips visible in the nav center.
    const chips = nav.getByText('bientôt')
    await expect(chips.first()).toBeVisible()
  })

  test('Coaching link is present', async ({ page }) => {
    await page.goto(ROUTE)
    const nav = page.getByRole('navigation', { name: 'Primary' })
    await expect(nav.getByText('Coaching')).toBeVisible()
  })

  test('unauthenticated right side shows Pricing, Log in, Start Free', async ({ page }) => {
    await page.goto(ROUTE)
    const nav = page.getByRole('navigation', { name: 'Primary' })
    await expect(nav.getByRole('link', { name: 'Pricing' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Log in' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Start Free' })).toBeVisible()
  })

  test('Pricing links to /tarifs', async ({ page }) => {
    await page.goto(ROUTE)
    const nav = page.getByRole('navigation', { name: 'Primary' })
    const pricingLink = nav.getByRole('link', { name: 'Pricing' })
    await expect(pricingLink).toHaveAttribute('href', '/tarifs')
  })

  test('Log in links to /connexion', async ({ page }) => {
    await page.goto(ROUTE)
    const nav = page.getByRole('navigation', { name: 'Primary' })
    await expect(nav.getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/connexion')
  })

  test('Start Free links to /inscription', async ({ page }) => {
    await page.goto(ROUTE)
    const nav = page.getByRole('navigation', { name: 'Primary' })
    await expect(nav.getByRole('link', { name: 'Start Free' })).toHaveAttribute('href', '/inscription')
  })

  test('Exams dropdown opens on click, shows TCF, DELF, French for Business', async ({ page }) => {
    await page.goto(ROUTE)
    const nav = page.getByRole('navigation', { name: 'Primary' })
    await nav.getByRole('button', { name: /exams/i }).click()
    const dropdown = nav.getByRole('menu')
    await expect(dropdown).toBeVisible()
    await expect(dropdown.getByText('TCF')).toBeVisible()
    await expect(dropdown.getByText('DELF')).toBeVisible()
    await expect(dropdown.getByText('French for Business')).toBeVisible()
  })

  test('Exams dropdown DELF and French for Business show bientôt', async ({ page }) => {
    await page.goto(ROUTE)
    const nav = page.getByRole('navigation', { name: 'Primary' })
    await nav.getByRole('button', { name: /exams/i }).click()
    const dropdown = nav.getByRole('menu')
    // DELF and French for Business rows have bientôt chips and are aria-disabled.
    const delf = dropdown.getByRole('menuitem', { name: /DELF/i })
    await expect(delf).toHaveAttribute('aria-disabled', 'true')
  })

  test('Exams dropdown closes after clicking TCF link', async ({ page }) => {
    await page.goto(ROUTE)
    const nav = page.getByRole('navigation', { name: 'Primary' })
    await nav.getByRole('button', { name: /exams/i }).click()
    await expect(nav.getByRole('menu')).toBeVisible()
    await nav.getByRole('menu').getByRole('menuitem', { name: 'TCF' }).click()
    // Dropdown should close regardless of where the navigation takes the user.
    await expect(nav.getByRole('menu')).not.toBeVisible()
  })

  test('Vocabulary link points to /la-methode', async ({ page }) => {
    await page.goto('/la-bibliotheque')
    const nav = page.getByRole('navigation', { name: 'Primary' })
    await expect(nav.getByRole('link', { name: 'Vocabulary' })).toHaveAttribute('href', '/la-methode')
  })

  test('Library link points to /la-bibliotheque', async ({ page }) => {
    await page.goto(ROUTE)
    const nav = page.getByRole('navigation', { name: 'Primary' })
    await expect(nav.getByRole('link', { name: 'Library' })).toHaveAttribute('href', '/la-bibliotheque')
  })
})

test.describe('F-441 -- TopNav IA mobile (375)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('TopNav is hidden on mobile (BottomNav owns mobile)', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto(ROUTE)
    const nav = page.getByRole('navigation', { name: 'Primary' })
    await expect(nav).toBeHidden()
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-441-la-methode-375.png'), fullPage: false })
  })
})

test.describe('F-441 -- TopNav IA (authenticated)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page)
  })

  test('authenticated right side shows avatar, not Log in or Start Free', async ({ page }) => {
    await page.goto(ROUTE)
    const nav = page.getByRole('navigation', { name: 'Primary' })
    await expect(nav).toBeVisible()
    // Log in and Start Free should NOT be present for authenticated users.
    await expect(nav.getByRole('link', { name: 'Log in' })).not.toBeVisible()
    await expect(nav.getByRole('link', { name: 'Start Free' })).not.toBeVisible()
    // Avatar button (profile dropdown trigger) should be visible.
    await expect(page.getByTestId('topnav-avatar')).toBeVisible()
  })
})
