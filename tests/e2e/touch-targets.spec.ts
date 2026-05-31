import { test, expect } from '@playwright/test'
import { getFailingTouchTargets } from '../helpers/interactiveElements'
import { injectAuthToken } from '../helpers/auth-e2e'

test.beforeEach(async ({ page }) => {
  await injectAuthToken(page)
})

// All interactive routes in the app
const ROUTES = [
  '/',
  '/dashboard',
  '/l-examen/diagnostic/results',
  '/l-examen/diagnostic/tache/1',
  '/cours/methode-tcf-canada',
  '/cours/methode-tcf-canada/lecon-1',
  '/la-bibliotheque',
  '/la-bibliotheque/practice',
  '/paywall',
]

test.use({ viewport: { width: 375, height: 667 }, isMobile: true })

for (const route of ROUTES) {
  test(`touch targets ≥44×44px on ${route} (mobile 375px)`, async ({ page }) => {
    await page.goto(route)
    // Wait for interactive elements to render
    await page.waitForLoadState('networkidle')
    const failing = await getFailingTouchTargets(page)
    if (failing.length > 0) {
      const details = failing
        .map((f) => `  ${f.tag}[data-testid="${f.testId}"] ${f.width}×${f.height}px${f.href ? ` href="${f.href}"` : ''}`)
        .join('\n')
      throw new Error(`Touch targets < 44×44px on ${route}:\n${details}`)
    }
    expect(failing).toHaveLength(0)
  })
}
