import { test, expect } from '@playwright/test'
import { injectAuthToken } from '../helpers/auth-e2e'

test.beforeEach(async ({ page }) => {
  await injectAuthToken(page)
})


test.describe('Le Vocabulaire test — desktop (1280×800)', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('renders inside the (app) shell with header, question 1, 4 choices, disabled Submit', async ({
    page,
  }) => {
    await page.goto('/la-bibliotheque/test')
    await expect(page.getByTestId('app-shell-sidebar')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1, name: /^test$/i })).toBeVisible()
    await expect(
      page.getByText(/10 chunks, à vous de retrouver la traduction\./i),
    ).toBeVisible()
    await expect(page.getByTestId('quiz-progress')).toHaveText(/question 1 sur 10/i)
    for (let i = 0; i < 4; i++) {
      await expect(page.getByTestId(`quiz-choice-${i}`)).toBeVisible()
    }
    await expect(page.getByTestId('quiz-submit')).toBeDisabled()
  })

  test('renders inside (app) shell at /la-bibliotheque/test (route un-nav\'d in F-447 but still exists)', async ({ page }) => {
    await page.goto('/la-bibliotheque/test')
    await expect(page.getByTestId('app-shell-sidebar')).toBeVisible()
  })

  test('selecting a choice enables Submit; clicking Submit reveals feedback and Question suivante', async ({
    page,
  }) => {
    await page.goto('/la-bibliotheque/test')
    await page.getByTestId('quiz-choice-0').click()
    await expect(page.getByTestId('quiz-submit')).toBeEnabled()
    await page.getByTestId('quiz-submit').click()
    await expect(page.getByTestId('quiz-submit')).toHaveCount(0)
    await expect(page.getByTestId('quiz-next')).toBeVisible()
    const correctCount = await page.locator('[data-testid^="quiz-choice-"][data-state="correct"]').count()
    expect(correctCount).toBe(1)
  })

  test('navigating through all 10 questions reaches the results panel; Recommencer returns to Q1', async ({
    page,
  }) => {
    await page.goto('/la-bibliotheque/test')
    for (let i = 0; i < 10; i++) {
      await expect(page.getByTestId('quiz-progress')).toHaveText(
        new RegExp(`question ${i + 1} sur 10`, 'i'),
      )
      await page.getByTestId('quiz-choice-0').click()
      await page.getByTestId('quiz-submit').click()
      await page.getByTestId('quiz-next').click()
    }
    await expect(page.getByTestId('quiz-question')).toHaveCount(0)
    await expect(page.getByTestId('quiz-results')).toBeVisible()
    await expect(page.getByTestId('quiz-results-score')).toHaveText(/\d+\s*\/\s*10/)
    await expect(page.getByTestId('quiz-results-restart')).toBeVisible()
    await expect(page.getByTestId('quiz-results-back-to-list')).toHaveAttribute(
      'href',
      '/la-bibliotheque',
    )

    await page.getByTestId('quiz-results-restart').click()
    await expect(page.getByTestId('quiz-progress')).toHaveText(/question 1 sur 10/i)
    await expect(page.getByTestId('quiz-submit')).toBeDisabled()
  })

  test('clicking "Tester" CTA from /la-bibliotheque lands on /la-bibliotheque/test', async ({ page }) => {
    await page.goto('/la-bibliotheque')
    await page.getByTestId('vocab-cta-test').click()
    await expect(page).toHaveURL(/\/la-bibliotheque\/test$/)
    await expect(page.getByTestId('quiz-question')).toBeVisible()
  })

  test('back-to-list link from header navigates to /la-bibliotheque', async ({ page }) => {
    await page.goto('/la-bibliotheque/test')
    await page.getByTestId('quiz-back-to-list').click()
    await expect(page).toHaveURL(/\/la-bibliotheque$/)
  })

  // MOCK-009 — delayed quiz-next, feedback border classes, flavor copy
  test('Question suivante appears after Submit (Playwright auto-waits)', async ({ page }) => {
    await page.goto('/la-bibliotheque/test')
    await page.getByTestId('quiz-choice-0').click()
    await page.getByTestId('quiz-submit').click()
    await expect(page.getByTestId('quiz-next')).toBeVisible()
  })

  test('correct choice has class quiz-choice-correct after Submit', async ({ page }) => {
    await page.goto('/la-bibliotheque/test')
    await page.getByTestId('quiz-choice-0').click()
    await page.getByTestId('quiz-submit').click()
    // Find whichever choice is correct
    const correct = page.locator('[data-state="correct"]')
    await expect(correct).toHaveClass(/quiz-choice-correct/)
  })

  test('quiz results show flavor copy text', async ({ page }) => {
    await page.goto('/la-bibliotheque/test')
    for (let i = 0; i < 10; i++) {
      await page.getByTestId('quiz-choice-0').click()
      await page.getByTestId('quiz-submit').click()
      await page.getByTestId('quiz-next').click()
    }
    await expect(page.getByTestId('quiz-results-flavor')).toBeVisible()
  })
})

test.describe('Le Vocabulaire test — mobile (375×667)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('renders the quiz single-column without horizontal overflow', async ({ page }) => {
    await page.goto('/la-bibliotheque/test')
    await expect(page.getByTestId('quiz-question')).toBeVisible()
    for (let i = 0; i < 4; i++) {
      await expect(page.getByTestId(`quiz-choice-${i}`)).toBeVisible()
    }
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const clientWidth = await page.evaluate(() => document.body.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })

  test('each choice card has a tap target ≥ 44×44px on mobile', async ({ page }) => {
    await page.goto('/la-bibliotheque/test')
    for (let i = 0; i < 4; i++) {
      const box = await page.getByTestId(`quiz-choice-${i}`).boundingBox()
      expect(box).not.toBeNull()
      expect(box!.height).toBeGreaterThanOrEqual(44)
      expect(box!.width).toBeGreaterThanOrEqual(44)
    }
  })
})
