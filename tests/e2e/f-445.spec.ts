// F-445 -- Landing/marketing header migration to locked IA.
// Verifies: TopNav renders on landing page, full IA nav visible, Start Free present,
// Les Pièges absent, framed wordmark present, StickyHeader gone on /, mobile section works.

import { test, expect } from '@playwright/test'
import { injectAuthToken } from '../helpers/auth-e2e'
import * as path from 'path'
import * as fs from 'fs'

const SCREENSHOT_DIR = path.join(__dirname, '../screenshots')

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

test.describe('F-445 -- Landing nav (unauthenticated, desktop 1440)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('TopNav renders on landing page (/) with full IA', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: 'Primary' })
    await expect(nav).toBeVisible()
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-445-landing-1440.png'), fullPage: false })
  })

  test('center nav shows Vocabulary, Exams, Store (F-447: Library replaced by Store)', async ({ page }) => {
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: 'Primary' })
    await expect(nav.getByText('Vocabulary')).toBeVisible()
    await expect(nav.getByText('Exams')).toBeVisible()
    await expect(nav.getByText('Store')).toBeVisible()
  })

  test('bientôt chips visible for Real French and AI Tutor', async ({ page }) => {
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: 'Primary' })
    await expect(nav.getByText('Real French')).toBeVisible()
    await expect(nav.getByText('AI Tutor')).toBeVisible()
  })

  test('Coaching link is present', async ({ page }) => {
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: 'Primary' })
    await expect(nav.getByText('Coaching')).toBeVisible()
  })

  test('right side shows Pricing, Log in, Start Free', async ({ page }) => {
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: 'Primary' })
    await expect(nav.getByRole('link', { name: 'Pricing' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Log in' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Start Free' })).toBeVisible()
  })

  test('Start Free links to /inscription', async ({ page }) => {
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: 'Primary' })
    await expect(nav.getByRole('link', { name: 'Start Free' })).toHaveAttribute('href', '/inscription')
  })

  test('Pricing links to /tarifs', async ({ page }) => {
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: 'Primary' })
    await expect(nav.getByRole('link', { name: 'Pricing' })).toHaveAttribute('href', '/tarifs')
  })

  test('Log in links to /connexion', async ({ page }) => {
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: 'Primary' })
    await expect(nav.getByRole('link', { name: 'Log in' })).toHaveAttribute('href', '/connexion')
  })

  test('Les Pièges is absent from the nav', async ({ page }) => {
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: 'Primary' })
    await expect(nav.getByText(/pièges/i)).not.toBeVisible()
  })

  test('framed wordmark is present in the nav', async ({ page }) => {
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: 'Primary' })
    await expect(nav.getByTestId('wordmark')).toBeVisible()
  })

  test('StickyHeader does not render on landing page', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('sticky-header')).not.toBeVisible()
  })

  test('Exams dropdown opens on click from landing page', async ({ page }) => {
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: 'Primary' })
    await nav.getByRole('button', { name: /exams/i }).click()
    const dropdown = nav.getByRole('menu')
    await expect(dropdown).toBeVisible()
    await expect(dropdown.getByText('TCF')).toBeVisible()
    await expect(dropdown.getByText('DELF')).toBeVisible()
    await expect(dropdown.getByText('French for Business')).toBeVisible()
  })

  test('no horizontal overflow at 1440', async ({ page }) => {
    await page.goto('/')
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2)
  })
})

test.describe('F-445 -- Landing nav (unauthenticated, mobile 375)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('mobile header renders on landing page (/)', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto('/')
    await expect(page.getByTestId('topnav-mobile')).toBeVisible()
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-445-landing-375.png'), fullPage: false })
  })

  test('mobile hamburger opens the mobile nav drawer', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /open menu/i }).click()
    await expect(page.getByRole('navigation', { name: 'Primary mobile' })).toBeVisible()
  })

  test('mobile drawer shows Vocabulary and Start Free', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /open menu/i }).click()
    const drawer = page.getByRole('navigation', { name: 'Primary mobile' })
    await expect(drawer.getByText('Vocabulary')).toBeVisible()
    await expect(drawer.getByRole('link', { name: 'Start Free' })).toBeVisible()
  })

  test('no horizontal overflow at 375', async ({ page }) => {
    await page.goto('/')
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2)
  })
})

test.describe('F-445 -- Landing nav (authenticated, desktop 1440)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test.beforeEach(async ({ page }) => {
    await injectAuthToken(page)
  })

  // F-446 shell split: TopNav returns null when authenticated.
  // Authenticated users get the sidebar (AppShell), not TopNav.
  test('TopNav is absent when authenticated (shell split)', async ({ page }) => {
    await page.goto('/tableau-de-bord')
    await expect(page.getByTestId('topnav-desktop')).not.toBeVisible()
    expect(await page.getByTestId('topnav-avatar').count()).toBe(0)
  })
})
