import { test, expect } from '@playwright/test'
import { injectAuthToken } from '../helpers/auth-e2e'

test.beforeEach(async ({ page }) => {
  await injectAuthToken(page)
})


test.describe('Le Vocabulaire practice — desktop (1280×800)', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('renders inside (app) shell with header, first card, progress, and action row', async ({
    page,
  }) => {
    await page.goto('/la-bibliotheque/practice')
    await expect(page.getByTestId('app-shell-sidebar')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1, name: /pratique/i })).toBeVisible()
    await expect(page.getByText(/révisez vos chunks, un par un\./i)).toBeVisible()
    await expect(page.getByTestId('practice-progress')).toHaveText(/carte 1 sur 60/i)
    await expect(page.getByTestId('flashcard')).toBeVisible()
    await expect(page.getByTestId('flashcard')).toHaveAttribute('data-flipped', 'false')
    await expect(page.getByTestId('practice-action-review')).toBeVisible()
    await expect(page.getByTestId('practice-action-next')).toBeVisible()
    await expect(page.getByTestId('practice-action-known')).toBeVisible()
    await expect(page.getByTestId('practice-prev')).toBeDisabled()
  })

  test('renders inside (app) shell at /la-bibliotheque/practice (route un-nav\'d in F-447 but still exists)', async ({
    page,
  }) => {
    await page.goto('/la-bibliotheque/practice')
    await expect(page.getByTestId('app-shell-sidebar')).toBeVisible()
  })

  test('clicking the card flips it; clicking again flips it back', async ({ page }) => {
    await page.goto('/la-bibliotheque/practice')
    const card = page.getByTestId('flashcard')
    await expect(card).toHaveAttribute('data-flipped', 'false')
    await card.click()
    await expect(card).toHaveAttribute('data-flipped', 'true')
    await card.click()
    await expect(card).toHaveAttribute('data-flipped', 'false')
  })

  test('spacebar flips the card when it has focus', async ({ page }) => {
    await page.goto('/la-bibliotheque/practice')
    const card = page.getByTestId('flashcard')
    await card.focus()
    await expect(card).toHaveAttribute('data-flipped', 'false')
    await page.keyboard.press(' ')
    await expect(card).toHaveAttribute('data-flipped', 'true')
  })

  test('clicking Suivant advances to card 2', async ({ page }) => {
    await page.goto('/la-bibliotheque/practice')
    await page.getByTestId('practice-action-next').click()
    await expect(page.getByTestId('practice-progress')).toHaveText(/carte 2 sur 60/i)
    await expect(page.getByTestId('practice-prev')).toBeEnabled()
  })

  test('advancing through all 60 cards shows the end-of-deck panel; Recommencer resets to card 1', async ({
    page,
  }) => {
    await page.goto('/la-bibliotheque/practice')
    for (let i = 0; i < 60; i++) {
      await page.getByTestId('practice-action-next').click()
    }
    await expect(page.getByTestId('flashcard')).toHaveCount(0)
    await expect(page.getByTestId('end-of-deck')).toBeVisible()
    await expect(page.getByTestId('end-of-deck-restart')).toBeVisible()
    await expect(page.getByTestId('end-of-deck-back-to-list')).toHaveAttribute(
      'href',
      '/la-bibliotheque',
    )

    await page.getByTestId('end-of-deck-restart').click()
    await expect(page.getByTestId('practice-progress')).toHaveText(/carte 1 sur 60/i)
    await expect(page.getByTestId('flashcard')).toHaveAttribute('data-flipped', 'false')
  })

  test('clicking "Pratiquer" CTA from /la-bibliotheque lands on /la-bibliotheque/practice', async ({
    page,
  }) => {
    await page.goto('/la-bibliotheque')
    await page.getByTestId('vocab-cta-practice').click()
    await expect(page).toHaveURL(/\/la-bibliotheque\/practice$/)
    await expect(page.getByTestId('flashcard')).toBeVisible()
  })

  test('back-to-list link from header navigates to /la-bibliotheque', async ({ page }) => {
    await page.goto('/la-bibliotheque/practice')
    await page.getByTestId('practice-back-to-list').click()
    await expect(page).toHaveURL(/\/la-bibliotheque$/)
  })

  // MOCK-009 — 3D flip transform, action button chip colors
  test('card flip applies rotateY transform', async ({ page }) => {
    await page.goto('/la-bibliotheque/practice')
    const card = page.getByTestId('flashcard')
    await card.click()
    const transform = await card.evaluate((el: HTMLElement) => el.style.transform)
    expect(transform).toContain('rotateY(180deg)')
  })

  test('À revoir and Connu action buttons are visible and have non-transparent backgrounds', async ({ page }) => {
    await page.goto('/la-bibliotheque/practice')
    await expect(page.getByTestId('practice-action-review')).toBeVisible()
    await expect(page.getByTestId('practice-action-known')).toBeVisible()
    const reviewBg = await page.getByTestId('practice-action-review').evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    )
    expect(reviewBg).not.toBe('rgba(0, 0, 0, 0)')
    expect(reviewBg).not.toBe('transparent')
  })
})

test.describe('Le Vocabulaire practice — mobile (375×667)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('renders the practice surface single-column without horizontal overflow', async ({
    page,
  }) => {
    await page.goto('/la-bibliotheque/practice')
    await expect(page.getByTestId('flashcard')).toBeVisible()
    await expect(page.getByTestId('practice-action-next')).toBeVisible()
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const clientWidth = await page.evaluate(() => document.body.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })

  test('each of the 3 action buttons has a tap target ≥ 44×44px on mobile', async ({ page }) => {
    await page.goto('/la-bibliotheque/practice')
    for (const id of [
      'practice-action-review',
      'practice-action-next',
      'practice-action-known',
    ] as const) {
      const box = await page.getByTestId(id).boundingBox()
      expect(box).not.toBeNull()
      expect(box!.height).toBeGreaterThanOrEqual(44)
      expect(box!.width).toBeGreaterThanOrEqual(44)
    }
  })

  // MOCK-009 — mobile card full-width
  test('flashcard is full-width on mobile', async ({ page }) => {
    await page.goto('/la-bibliotheque/practice')
    const cardBox = await page.getByTestId('flashcard').boundingBox()
    const bodyWidth = await page.evaluate(() => document.body.clientWidth)
    expect(cardBox).not.toBeNull()
    expect(cardBox!.width).toBeGreaterThanOrEqual(bodyWidth * 0.85)
  })
})
