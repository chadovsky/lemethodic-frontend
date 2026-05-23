import { test, expect } from '@playwright/test'
import { injectAuthToken } from '../helpers/auth-e2e'

test.beforeEach(async ({ page }) => {
  await injectAuthToken(page)
})

test.describe("L'École lesson list — desktop (1280×800)", () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('renders page header inside the (app) shell', async ({ page }) => {
    await page.goto('/ecole')
    await expect(page.getByTestId('app-shell-sidebar')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1, name: /l['']école/i })).toBeVisible()
    await expect(page.getByText(/la méthode en 27 leçons\./i)).toBeVisible()
  })

  test('shows L\'École as active in the sidebar', async ({ page }) => {
    await page.goto('/ecole')
    await expect(page.getByTestId('sidebar-link-ecole')).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  test('Fondations section has exactly 16 cards in numerical order', async ({ page }) => {
    await page.goto('/ecole')
    const cards = page.getByTestId('section-fondations').getByTestId('lesson-card')
    await expect(cards).toHaveCount(16)
    for (let i = 0; i < 16; i++) {
      await expect(cards.nth(i)).toHaveAttribute('data-lesson-id', String(i + 1))
    }
  })

  test('Approfondissement section has exactly 11 cards (17–27)', async ({ page }) => {
    await page.goto('/ecole')
    const cards = page.getByTestId('section-approfondissement').getByTestId('lesson-card')
    await expect(cards).toHaveCount(11)
    for (let i = 0; i < 11; i++) {
      await expect(cards.nth(i)).toHaveAttribute('data-lesson-id', String(17 + i))
    }
  })

  test('clicking lesson card #5 navigates to /ecole/5', async ({ page }) => {
    await page.goto('/ecole')
    await page.locator('[data-testid="lesson-card"][data-lesson-id="5"]').click()
    await expect(page).toHaveURL(/\/ecole\/5$/)
  })

  // MOCK-008 — state badge texts, lock icon, conditional ed-card-lift
  test('lessons 1–3 show Terminée badge', async ({ page }) => {
    await page.goto('/ecole')
    for (const id of [1, 2, 3]) {
      const badge = page
        .locator(`[data-testid="lesson-card"][data-lesson-id="${id}"]`)
        .getByTestId('lesson-card-state')
      await expect(badge).toHaveText('Terminée')
    }
  })

  test('lesson 4 shows Disponible badge', async ({ page }) => {
    await page.goto('/ecole')
    const badge = page
      .locator('[data-testid="lesson-card"][data-lesson-id="4"]')
      .getByTestId('lesson-card-state')
    await expect(badge).toHaveText('Disponible')
  })

  test('lesson 7 shows Verrouillée badge with lock icon', async ({ page }) => {
    await page.goto('/ecole')
    const card = page.locator('[data-testid="lesson-card"][data-lesson-id="7"]')
    await expect(card.getByTestId('lesson-card-state')).toHaveText('Verrouillée')
    await expect(card.getByTestId('lesson-lock-icon')).toBeVisible()
  })

  test('available card (lesson 4) has ed-card-lift class', async ({ page }) => {
    await page.goto('/ecole')
    await expect(
      page.locator('[data-testid="lesson-card"][data-lesson-id="4"]'),
    ).toHaveClass(/ed-card-lift/)
  })

  test('locked card (lesson 7) does not have ed-card-lift class', async ({ page }) => {
    await page.goto('/ecole')
    const card = page.locator('[data-testid="lesson-card"][data-lesson-id="7"]')
    const className = await card.getAttribute('class')
    expect(className ?? '').not.toMatch(/ed-card-lift/)
  })
})

test.describe("L'École lesson list — mobile (375×667)", () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('all 27 cards rendered and reachable on scroll', async ({ page }) => {
    await page.goto('/ecole')
    await expect(page.getByTestId('lesson-card')).toHaveCount(27)
    const last = page.getByTestId('lesson-card').last()
    await last.scrollIntoViewIfNeeded()
    await expect(last).toBeVisible()
  })

  test('no horizontal overflow on /ecole', async ({ page }) => {
    await page.goto('/ecole')
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const clientWidth = await page.evaluate(() => document.body.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })
})
