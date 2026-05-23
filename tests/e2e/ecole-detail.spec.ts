import { test, expect } from '@playwright/test'
import { injectAuthToken } from '../helpers/auth-e2e'

function mockLessonRaw(lessonNumber: number) {
  const phase = lessonNumber <= 16 ? 1 : 2
  return {
    id: lessonNumber,
    lesson_number: lessonNumber,
    code: `L${String(lessonNumber).padStart(3, '0')}`,
    title: `Leçon ${lessonNumber}`,
    short_description: `Description de la leçon ${lessonNumber}.`,
    status: 'unlocked',
    quiz_attempts: 0,
    quiz_best_score: null,
    completed_at: null,
    phase,
  }
}

test.beforeEach(async ({ page }) => {
  await injectAuthToken(page)

  // Quiz endpoint (more specific — register before lesson endpoint)
  await page.route(/\/api\/ecole\/lessons\/\d+\/quiz/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ questions: [], pass_threshold: 70 }),
    })
  })

  // Lesson detail endpoint
  await page.route(/\/api\/ecole\/lessons\/\d+$/, async (route) => {
    const url = route.request().url()
    const match = url.match(/\/api\/ecole\/lessons\/(\d+)$/)
    const lessonNumber = match ? parseInt(match[1]) : 1
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockLessonRaw(lessonNumber)),
    })
  })
})


test.describe("L'École lesson detail — desktop (1280×800)", () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('renders inside the (app) shell with breadcrumb, header, audio placeholder, sections, nav', async ({
    page,
  }) => {
    await page.goto('/ecole/3')
    await expect(page.getByTestId('app-shell-sidebar')).toBeVisible()
    await expect(page.getByTestId('lesson-breadcrumb')).toBeVisible()
    await expect(page.getByTestId('lesson-section-badge')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByTestId('audio-player-placeholder')).toBeVisible()
    await expect(page.getByTestId('lesson-section-introduction')).toBeVisible()
    await expect(page.getByTestId('lesson-section-methode')).toBeVisible()
    await expect(page.getByTestId('lesson-section-pratique')).toBeVisible()
    await expect(page.getByTestId('lesson-nav-prev')).toBeVisible()
    await expect(page.getByTestId('lesson-nav-next')).toBeVisible()
  })

  test('clicking next on /ecole/3 navigates to /ecole/4', async ({ page }) => {
    await page.goto('/ecole/3')
    await page.getByTestId('lesson-nav-next').click()
    await expect(page).toHaveURL(/\/ecole\/4$/)
  })

  test('/ecole/1 — no previous button, next links to /ecole/2', async ({ page }) => {
    await page.goto('/ecole/1')
    await expect(page.getByTestId('lesson-nav-prev')).toHaveCount(0)
    await expect(page.getByTestId('lesson-nav-next')).toHaveAttribute('href', '/ecole/2')
  })

  test('/ecole/27 — no next button, prev links to /ecole/26', async ({ page }) => {
    await page.goto('/ecole/27')
    await expect(page.getByTestId('lesson-nav-next')).toHaveCount(0)
    await expect(page.getByTestId('lesson-nav-prev')).toHaveAttribute('href', '/ecole/26')
  })

  test('/ecole/99 — renders Next.js 404', async ({ page }) => {
    const response = await page.goto('/ecole/99')
    expect(response?.status()).toBe(404)
  })

  test('/ecole/abc — renders Next.js 404 (non-numeric id)', async ({ page }) => {
    const response = await page.goto('/ecole/abc')
    expect(response?.status()).toBe(404)
  })

  test('lesson card #5 on /ecole resolves to /ecole/5 detail page', async ({ page }) => {
    // Also mock the list endpoint for this test
    await page.route('**/api/ecole/lessons', async (route) => {
      const lessons = Array.from({ length: 27 }, (_, i) => mockLessonRaw(i + 1))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ lessons }),
      })
    })
    await page.goto('/ecole')
    await page.locator('[data-testid="lesson-card"][data-lesson-id="5"]').click()
    await expect(page).toHaveURL(/\/ecole\/5$/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByTestId('audio-player-placeholder')).toBeVisible()
  })

  // MOCK-008 — waveform bars, keyboard navigation
  test('audio player shows 15 waveform bars on /ecole/3', async ({ page }) => {
    await page.goto('/ecole/3')
    await expect(page.getByTestId('lesson-waveform-bar')).toHaveCount(15)
  })

  test('ArrowRight on /ecole/3 navigates to /ecole/4', async ({ page }) => {
    await page.goto('/ecole/3')
    await page.keyboard.press('ArrowRight')
    await expect(page).toHaveURL(/\/ecole\/4$/)
  })

  test('ArrowLeft on /ecole/3 navigates to /ecole/2', async ({ page }) => {
    await page.goto('/ecole/3')
    await page.keyboard.press('ArrowLeft')
    await expect(page).toHaveURL(/\/ecole\/2$/)
  })

  test('ArrowLeft on /ecole/1 does not navigate away (boundary guard)', async ({ page }) => {
    await page.goto('/ecole/1')
    await page.keyboard.press('ArrowLeft')
    await expect(page).toHaveURL(/\/ecole\/1$/)
  })
})

test.describe("L'École lesson detail — mobile (375×667)", () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('renders /ecole/3 with audio placeholder full-width and content stacked', async ({
    page,
  }) => {
    await page.goto('/ecole/3')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByTestId('audio-player-placeholder')).toBeVisible()
    await expect(page.getByTestId('lesson-section-introduction')).toBeVisible()
  })

  test('no horizontal overflow on /ecole/3', async ({ page }) => {
    await page.goto('/ecole/3')
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const clientWidth = await page.evaluate(() => document.body.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })
})
