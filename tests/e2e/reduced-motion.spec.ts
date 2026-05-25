import { test, expect, type BrowserContext } from '@playwright/test'
import { injectAuthToken } from '../helpers/auth-e2e'

const ROUTES = [
  '/',
  '/dashboard',
  '/l-examen/results',
  '/l-examen/tache/1',
  '/la-methode',
  '/la-methode/lesson/1-1',
  '/la-bibliotheque',
  '/la-bibliotheque/practice',
  '/paywall',
]

// Animated test-ids to check for suppressed animation in reduced-motion mode
const ANIMATED_TESTIDS: Record<string, string[]> = {
  '/l-examen/results': ['results-score-block'],
}

let rmCtx: BrowserContext

test.beforeAll(async ({ browser }) => {
  rmCtx = await browser.newContext({ reducedMotion: 'reduce' })
})

test.afterAll(async () => {
  await rmCtx.close()
})

for (const route of ROUTES) {
  test(`reduced-motion: no horizontal overflow on ${route}`, async () => {
    const page = await rmCtx.newPage()
    await injectAuthToken(page)
    await page.goto(route)
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const clientWidth = await page.evaluate(() => document.body.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
    await page.close()
  })
}

test('reduced-motion: results-score-block animation is suppressed on /l-examen/results', async () => {
  const page = await rmCtx.newPage()
  await injectAuthToken(page)
  await page.goto('/l-examen/results')
  const scoreBlock = page.getByTestId('results-score-block')
  await expect(scoreBlock).toBeVisible()
  const animName = await scoreBlock.evaluate(
    (el) => getComputedStyle(el).animationName,
  )
  expect(animName).toBe('none')
  await page.close()
})

test('reduced-motion: ed-hero-rise elements have no animation on /', async () => {
  const page = await rmCtx.newPage()
  await page.goto('/')
  // If the hero rise animation exists, it must be suppressed
  const heroEls = page.locator('.ed-hero-rise')
  const count = await heroEls.count()
  if (count > 0) {
    const animName = await heroEls.first().evaluate(
      (el) => getComputedStyle(el).animationName,
    )
    expect(animName).toBe('none')
  }
  await page.close()
})

test('reduced-motion: CSS transitions are instant on score block', async () => {
  const page = await rmCtx.newPage()
  await injectAuthToken(page)
  await page.goto('/l-examen/results')
  const scoreBlock = page.getByTestId('results-score-block')
  await expect(scoreBlock).toBeVisible()
  // Under prefers-reduced-motion, transition-duration should be 0s or very short
  const transitionDuration = await scoreBlock.evaluate(
    (el) => getComputedStyle(el).transitionDuration,
  )
  // Either no transition (0s) or not set — acceptable: not 600ms or more
  const durationMs = parseFloat(transitionDuration) * 1000
  expect(durationMs).toBeLessThan(100)
  await page.close()
})
