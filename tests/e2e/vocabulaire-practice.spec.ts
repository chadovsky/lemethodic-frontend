import { test, expect } from '@playwright/test'

test.describe('Le Vocabulaire practice — desktop (1280×800)', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('renders inside (app) shell with header, first card, progress, and action row', async ({
    page,
  }) => {
    await page.goto('/vocabulaire/practice')
    await expect(page.getByTestId('app-shell-sidebar')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1, name: /pratique/i })).toBeVisible()
    await expect(page.getByText(/révisez vos chunks, un par un\./i)).toBeVisible()
    await expect(page.getByTestId('practice-progress')).toHaveText(/carte 1 sur 30/i)
    await expect(page.getByTestId('flashcard')).toBeVisible()
    await expect(page.getByTestId('flashcard')).toHaveAttribute('data-flipped', 'false')
    await expect(page.getByTestId('practice-action-review')).toBeVisible()
    await expect(page.getByTestId('practice-action-next')).toBeVisible()
    await expect(page.getByTestId('practice-action-known')).toBeVisible()
    await expect(page.getByTestId('practice-prev')).toBeDisabled()
  })

  test('shows Le Vocabulaire as active in the sidebar from /vocabulaire/practice', async ({
    page,
  }) => {
    await page.goto('/vocabulaire/practice')
    await expect(page.getByTestId('sidebar-link-vocabulaire')).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  test('clicking the card flips it; clicking again flips it back', async ({ page }) => {
    await page.goto('/vocabulaire/practice')
    const card = page.getByTestId('flashcard')
    await expect(card).toHaveAttribute('data-flipped', 'false')
    await card.click()
    await expect(card).toHaveAttribute('data-flipped', 'true')
    await card.click()
    await expect(card).toHaveAttribute('data-flipped', 'false')
  })

  test('spacebar flips the card when it has focus', async ({ page }) => {
    await page.goto('/vocabulaire/practice')
    const card = page.getByTestId('flashcard')
    await card.focus()
    await expect(card).toHaveAttribute('data-flipped', 'false')
    await page.keyboard.press(' ')
    await expect(card).toHaveAttribute('data-flipped', 'true')
  })

  test('clicking Suivant advances to card 2', async ({ page }) => {
    await page.goto('/vocabulaire/practice')
    await page.getByTestId('practice-action-next').click()
    await expect(page.getByTestId('practice-progress')).toHaveText(/carte 2 sur 30/i)
    await expect(page.getByTestId('practice-prev')).toBeEnabled()
  })

  test('advancing through all 30 cards shows the end-of-deck panel; Recommencer resets to card 1', async ({
    page,
  }) => {
    await page.goto('/vocabulaire/practice')
    for (let i = 0; i < 30; i++) {
      await page.getByTestId('practice-action-next').click()
    }
    await expect(page.getByTestId('flashcard')).toHaveCount(0)
    await expect(page.getByTestId('end-of-deck')).toBeVisible()
    await expect(page.getByTestId('end-of-deck-restart')).toBeVisible()
    await expect(page.getByTestId('end-of-deck-back-to-list')).toHaveAttribute(
      'href',
      '/vocabulaire',
    )

    await page.getByTestId('end-of-deck-restart').click()
    await expect(page.getByTestId('practice-progress')).toHaveText(/carte 1 sur 30/i)
    await expect(page.getByTestId('flashcard')).toHaveAttribute('data-flipped', 'false')
  })

  test('clicking "Pratiquer" CTA from /vocabulaire lands on /vocabulaire/practice', async ({
    page,
  }) => {
    await page.goto('/vocabulaire')
    await page.getByTestId('vocab-cta-practice').click()
    await expect(page).toHaveURL(/\/vocabulaire\/practice$/)
    await expect(page.getByTestId('flashcard')).toBeVisible()
  })

  test('back-to-list link from header navigates to /vocabulaire', async ({ page }) => {
    await page.goto('/vocabulaire/practice')
    await page.getByTestId('practice-back-to-list').click()
    await expect(page).toHaveURL(/\/vocabulaire$/)
  })
})

test.describe('Le Vocabulaire practice — mobile (375×667)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('renders the practice surface single-column without horizontal overflow', async ({
    page,
  }) => {
    await page.goto('/vocabulaire/practice')
    await expect(page.getByTestId('flashcard')).toBeVisible()
    await expect(page.getByTestId('practice-action-next')).toBeVisible()
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const clientWidth = await page.evaluate(() => document.body.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })

  test('each of the 3 action buttons has a tap target ≥ 44×44px on mobile', async ({ page }) => {
    await page.goto('/vocabulaire/practice')
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
})
