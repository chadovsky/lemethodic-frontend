import { test, expect } from '@playwright/test'
import { injectAuthToken } from '../helpers/auth-e2e'

function makeMockLessonsRaw() {
  const lessons = []
  for (let i = 1; i <= 27; i++) {
    const phase = i <= 16 ? 1 : 2
    const status = i <= 3 ? 'completed' : i <= 6 ? 'unlocked' : 'locked'
    lessons.push({
      id: i,
      lesson_number: i,
      code: i <= 16 ? `F${String(i).padStart(3, '0')}` : `A${String(i - 16).padStart(3, '0')}`,
      title: `Leçon ${i}`,
      short_description: `Description de la leçon ${i}.`,
      status,
      quiz_attempts: 0,
      quiz_best_score: null,
      completed_at: i <= 3 ? '2026-01-01T00:00:00Z' : null,
      phase,
    })
  }
  return lessons
}

test.beforeEach(async ({ page }) => {
  await injectAuthToken(page)
  await page.route('**/api/ecole/lessons', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ lessons: makeMockLessonsRaw() }),
    })
  })
})

test.describe("La Méthode lesson list — desktop (1280×800)", () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('renders page header inside the (app) shell', async ({ page }) => {
    await page.goto('/cours/methode-tcf-canada')
    await expect(page.getByTestId('app-shell-sidebar')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1, name: /la méthode/i })).toBeVisible()
    await expect(page.getByText(/la méthode en 27 leçons\./i)).toBeVisible()
  })

  test("shows La Méthode as active in the sidebar", async ({ page }) => {
    await page.goto('/cours/methode-tcf-canada')
    await expect(page.getByTestId('sidebar-link-cours/methode-tcf-canada')).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  test('Fondations section has exactly 16 cards in numerical order', async ({ page }) => {
    await page.goto('/cours/methode-tcf-canada')
    const cards = page.getByTestId('section-fondations').getByTestId('lesson-card')
    await expect(cards).toHaveCount(16)
    for (let i = 0; i < 16; i++) {
      await expect(cards.nth(i)).toHaveAttribute('data-lesson-id', String(i + 1))
    }
  })

  test('Approfondissement section has exactly 11 cards (17–27)', async ({ page }) => {
    await page.goto('/cours/methode-tcf-canada')
    const cards = page.getByTestId('section-approfondissement').getByTestId('lesson-card')
    await expect(cards).toHaveCount(11)
    for (let i = 0; i < 11; i++) {
      await expect(cards.nth(i)).toHaveAttribute('data-lesson-id', String(17 + i))
    }
  })

  test('clicking lesson card #5 navigates to /cours/methode-tcf-canada/lecon-5', async ({ page }) => {
    await page.goto('/cours/methode-tcf-canada')
    await page.locator('[data-testid="lesson-card"][data-lesson-id="5"]').click()
    await expect(page).toHaveURL(/\/cours\/methode-tcf-canada\/lecon-5$/)
  })

  // MOCK-008 — state badge texts, lock icon, conditional ed-card-lift
  test('lessons 1–3 show Terminée badge', async ({ page }) => {
    await page.goto('/cours/methode-tcf-canada')
    for (const id of [1, 2, 3]) {
      const badge = page
        .locator(`[data-testid="lesson-card"][data-lesson-id="${id}"]`)
        .getByTestId('lesson-card-state')
      await expect(badge).toHaveText('Terminée')
    }
  })

  test('lesson 4 shows Disponible badge', async ({ page }) => {
    await page.goto('/cours/methode-tcf-canada')
    const badge = page
      .locator('[data-testid="lesson-card"][data-lesson-id="4"]')
      .getByTestId('lesson-card-state')
    await expect(badge).toHaveText('Disponible')
  })

  test('lesson 7 shows Verrouillée badge with lock icon', async ({ page }) => {
    await page.goto('/cours/methode-tcf-canada')
    const card = page.locator('[data-testid="lesson-card"][data-lesson-id="7"]')
    await expect(card.getByTestId('lesson-card-state')).toHaveText('Verrouillée')
    await expect(card.getByTestId('lesson-lock-icon')).toBeVisible()
  })

  test('available card (lesson 4) has ed-card-lift class', async ({ page }) => {
    await page.goto('/cours/methode-tcf-canada')
    await expect(
      page.locator('[data-testid="lesson-card"][data-lesson-id="4"]'),
    ).toHaveClass(/ed-card-lift/)
  })

  test('locked card (lesson 7) does not have ed-card-lift class', async ({ page }) => {
    await page.goto('/cours/methode-tcf-canada')
    const card = page.locator('[data-testid="lesson-card"][data-lesson-id="7"]')
    const className = await card.getAttribute('class')
    expect(className ?? '').not.toMatch(/ed-card-lift/)
  })
})

test.describe("La Méthode lesson list — mobile (375×667)", () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('all 27 cards rendered and reachable on scroll', async ({ page }) => {
    await page.goto('/cours/methode-tcf-canada')
    await expect(page.getByTestId('lesson-card')).toHaveCount(27)
    const last = page.getByTestId('lesson-card').last()
    await last.scrollIntoViewIfNeeded()
    await expect(last).toBeVisible()
  })

  test('no horizontal overflow on /cours/methode-tcf-canada', async ({ page }) => {
    await page.goto('/cours/methode-tcf-canada')
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const clientWidth = await page.evaluate(() => document.body.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })
})
