import { test, expect } from '@playwright/test'
import { getFailingTouchTargets } from '../helpers/interactiveElements'

// All interactive routes in the app
const ROUTES = [
  '/',
  '/dashboard',
  '/diagnostic/results',
  '/diagnostic/tache/1',
  '/ecole',
  '/ecole/lesson/1-1',
  '/vocabulaire',
  '/vocabulaire/practice',
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
