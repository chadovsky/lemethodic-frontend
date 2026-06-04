/**
 * t5 — Dark mode gallery capture.
 *
 * Visits all reachable static routes in light + dark mode at 1440px
 * (desktop) and 375px (mobile). Screenshots land in t5-dark-mode-gallery/
 * (gitignored). No behavioral assertions — pure visual artifact for
 * Chadi's sign-off review.
 *
 * Dark mode: page.emulateMedia({ colorScheme: 'dark' }) set before
 * navigation. next-themes reads prefers-color-scheme on hydration and
 * applies .dark to <html>.
 */

import { test } from '@playwright/test'
import path from 'path'
import fs from 'fs'
import { injectAuthToken } from '../helpers/auth-e2e'

const GALLERY_DIR = path.join(process.cwd(), 't5-dark-mode-gallery')

// Routes that need auth injection (inside the (app) route group).
const AUTH_ROUTES = [
  '/dashboard',
  '/la-methode',
  '/la-methode/intro',
  '/l-examen',
  '/l-examen/diagnostic/results',
  '/l-examen/diagnostic/tache/1',
  '/l-examen/diagnostic/tache/2',
  '/l-examen/diagnostic/tache/3',
  '/la-bibliotheque',
  '/la-bibliotheque/practice',
  '/la-bibliotheque/test',
  '/l-examen/expression-orale',
  '/l-examen/expression-orale/tache-1',
  '/l-examen/expression-orale/tache-2',
  '/l-examen/expression-ecrite',
  '/l-examen/expression-ecrite/history',
  '/progress',
  '/more',
  '/account',
]

// Public marketing / funnel routes.
const PUBLIC_ROUTES = [
  '/',
  '/fr',
  '/fr/library',
  '/library',
  '/signup',
  '/login',
  '/paywall',
  '/onboarding',
  '/la-methode',
  '/mentions-legales',
  '/confidentialite',
  '/cgv',
  '/refund',
]

const ALL_ROUTES = [
  ...PUBLIC_ROUTES.map((r) => ({ route: r, auth: false })),
  ...AUTH_ROUTES.map((r) => ({ route: r, auth: true })),
]

const VIEWPORTS = [
  { label: '1440', width: 1440, height: 900 },
  { label: '375', width: 375, height: 812 },
] as const

function slug(route: string) {
  return route === '/' ? 'home' : route.replace(/\//g, '-').replace(/^-/, '')
}

test.describe('t5 dark mode gallery', () => {
  test.beforeAll(() => {
    fs.mkdirSync(GALLERY_DIR, { recursive: true })
  })

  for (const { route, auth } of ALL_ROUTES) {
    for (const { label, width, height } of VIEWPORTS) {
      const routeSlug = slug(route)

      test(`[light] ${route} @ ${label}px`, async ({ page }) => {
        await page.setViewportSize({ width, height })
        if (auth) await injectAuthToken(page)
        await page.goto(route, { waitUntil: 'load' })
        await page.screenshot({
          path: path.join(GALLERY_DIR, `${routeSlug}-light-${label}.png`),
          fullPage: true,
        })
      })

      test(`[dark] ${route} @ ${label}px`, async ({ page }) => {
        await page.setViewportSize({ width, height })
        await page.emulateMedia({ colorScheme: 'dark' })
        if (auth) await injectAuthToken(page)
        await page.goto(route, { waitUntil: 'load' })
        // Wait for next-themes to apply .dark class before screenshotting.
        await page.waitForSelector('html.dark', { timeout: 5000 }).catch(() => {
          // Some routes (marketing, unauthenticated) may not render the
          // theme toggle and next-themes may not apply the class. Proceed.
        })
        await page.screenshot({
          path: path.join(GALLERY_DIR, `${routeSlug}-dark-${label}.png`),
          fullPage: true,
        })
      })
    }
  }
})
