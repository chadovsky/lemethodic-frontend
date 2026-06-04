import { test, expect } from '@playwright/test'
import { injectAuthToken } from '../helpers/auth-e2e'

test.beforeEach(async ({ page }) => {
  await injectAuthToken(page)
})


test.describe('Le Diagnostic results — desktop (1280×800)', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('renders all sections inside the (app) shell', async ({ page }) => {
    await page.goto('/l-examen/diagnostic/results')
    await expect(page.getByTestId('app-shell-sidebar')).toBeVisible()
    await expect(page.getByTestId('breadcrumb')).toBeVisible()
    await expect(page.getByTestId('results-score')).toContainText('C1')
    await expect(page.getByText(/niveau estimé tcf canada/i)).toBeVisible()
    await expect(page.getByTestId('results-section-couches')).toBeVisible()
    await expect(page.getByTestId('results-section-taches')).toBeVisible()
    await expect(page.getByTestId('results-section-recommendations')).toBeVisible()
    await expect(page.getByTestId('results-action-recommencer')).toBeVisible()
    await expect(page.getByTestId('results-action-dashboard')).toBeVisible()
  })

  test('sidebar shows Le Diagnostic as active on results route', async ({ page }) => {
    await page.goto('/l-examen/diagnostic/results')
    await expect(page.getByTestId('sidebar-link-l-examen')).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  test('5-couche breakdown shows all 5 rows', async ({ page }) => {
    await page.goto('/l-examen/diagnostic/results')
    await expect(page.getByTestId('couche-row')).toHaveCount(5)
  })

  test('"Relire l\'énoncé" for Tâche 2 links to /l-examen/tache/2', async ({
    page,
  }) => {
    await page.goto('/l-examen/diagnostic/results')
    const link = page.getByTestId('tache-summary-relire-2')
    await expect(link).toBeVisible()
    await expect(link).toHaveAttribute('href', '/l-examen/diagnostic/tache/2')
  })

  test('"Recommencer le diagnostic" navigates to /l-examen/diagnostic/tache/1', async ({
    page,
  }) => {
    await page.goto('/l-examen/diagnostic/results')
    await page.getByTestId('results-action-recommencer').click()
    await expect(page).toHaveURL(/\/l-examen\/diagnostic\/tache\/1$/)
  })

  test('"Retour au tableau de bord" navigates to /tableau-de-bord', async ({ page }) => {
    await page.goto('/l-examen/diagnostic/results')
    await page.getByTestId('results-action-dashboard').click()
    await expect(page).toHaveURL(/\/tableau-de-bord$/)
  })

  test('does not contain any <audio> element', async ({ page }) => {
    await page.goto('/l-examen/diagnostic/results')
    expect(await page.locator('audio').count()).toBe(0)
  })

  test('3 recommendation rows render with their CTAs', async ({ page }) => {
    await page.goto('/l-examen/diagnostic/results')
    await expect(page.getByTestId('recommendation-row')).toHaveCount(3)
  })

  test('couche bars have non-zero widths 700ms after mount', async ({ page }) => {
    await page.goto('/l-examen/diagnostic/results')
    await page.waitForTimeout(700)
    const widths = await page.getByTestId('couche-bar').evaluateAll(
      (els) => els.map((el) => parseFloat((el as HTMLElement).style.width)),
    )
    widths.forEach((w) => expect(w).toBeGreaterThan(0))
  })

  test('hovering a couche row reveals the gloss tooltip', async ({ page }) => {
    await page.goto('/l-examen/diagnostic/results')
    await page.getByTestId('couche-row').first().hover()
    await expect(page.getByTestId('couche-tooltip').first()).toBeVisible()
  })

  test('CEFR pill is visible and shows "C1"', async ({ page }) => {
    await page.goto('/l-examen/diagnostic/results')
    const pill = page.getByTestId('results-cefr-pill')
    await expect(pill).toBeVisible()
    await expect(pill).toContainText('C1')
  })

  test('each recommendation row has a chip badge and accent CTA', async ({ page }) => {
    await page.goto('/l-examen/diagnostic/results')
    await expect(page.getByTestId('recommendation-chip')).toHaveCount(3)
  })

  test('reduced-motion: score block animation is suppressed', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' })
    const page = await ctx.newPage()
    await injectAuthToken(page)
    await page.goto('/l-examen/diagnostic/results')
    const scoreBlock = page.getByTestId('results-score-block')
    await expect(scoreBlock).toBeVisible()
    const animName = await scoreBlock.evaluate(
      (el) => getComputedStyle(el).animationName,
    )
    // Chromium may return '' or 'none' when animation is suppressed — both are valid.
    expect(['none', '']).toContain(animName)
    await ctx.close()
  })
})

test.describe('Le Diagnostic results — mobile (375×667)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('no horizontal overflow', async ({ page }) => {
    await page.goto('/l-examen/diagnostic/results')
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const clientWidth = await page.evaluate(() => document.body.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })

  test('all key sections are visible on mobile', async ({ page }) => {
    await page.goto('/l-examen/diagnostic/results')
    await expect(page.getByTestId('results-score')).toBeVisible()
    await expect(page.getByTestId('results-section-couches')).toBeVisible()
    await expect(page.getByTestId('results-section-taches')).toBeVisible()
    await expect(page.getByTestId('results-action-recommencer')).toBeVisible()
  })

  test('couche gloss sentences are visible inline without hover', async ({ page }) => {
    await page.goto('/l-examen/diagnostic/results')
    const glosses = page.getByTestId('couche-gloss')
    await expect(glosses.first()).toBeVisible()
    expect(await glosses.count()).toBe(5)
  })
})
