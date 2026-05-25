import { test, expect } from '@playwright/test'
import { injectAuthToken } from '../helpers/auth-e2e'

test.beforeEach(async ({ page }) => {
  await injectAuthToken(page)
})


test.describe('Le Diagnostic landing â€” desktop (1280Ã—800)', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('renders header, sections, 3 tÃ¢che cards, 5-couche preview, CTA inside (app) shell', async ({
    page,
  }) => {
    await page.goto('/diagnostic')
    await expect(page.getByTestId('app-shell-sidebar')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1, name: /l'examen/i })).toBeVisible()
    await expect(
      page.getByText(/mesurez votre niveau rÃ©el en expression orale tcf canada\./i),
    ).toBeVisible()
    await expect(page.getByTestId('diagnostic-section-persona')).toBeVisible()
    await expect(page.getByTestId('diagnostic-section-overview')).toBeVisible()
    await expect(page.getByTestId('diagnostic-section-couches')).toBeVisible()
    await expect(page.getByTestId('tache-card')).toHaveCount(3)
    await expect(page.getByTestId('diagnostic-cta-start')).toBeVisible()
    await expect(page.getByTestId('diagnostic-past-score')).toBeVisible()
  })

  test('shows Le Diagnostic as active in the sidebar', async ({ page }) => {
    await page.goto('/diagnostic')
    await expect(page.getByTestId('sidebar-link-diagnostic')).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  test('primary CTA navigates to /diagnostic/tache/1', async ({ page }) => {
    await page.goto('/diagnostic')
    const cta = page.getByTestId('diagnostic-cta-start')
    await expect(cta).toHaveAttribute('href', '/diagnostic/tache/1')
    await cta.click()
    await expect(page).toHaveURL(/\/diagnostic\/tache\/1$/)
  })

  test('past-score link navigates to /diagnostic/results', async ({ page }) => {
    await page.goto('/diagnostic')
    const link = page.getByTestId('diagnostic-past-score-link')
    await expect(link).toHaveAttribute('href', '/diagnostic/results')
  })

  test('3 tÃ¢che cards render side-by-side at desktop width', async ({ page }) => {
    await page.goto('/diagnostic')
    const cards = page.getByTestId('tache-card')
    await expect(cards).toHaveCount(3)
    const boxes = await Promise.all(
      [0, 1, 2].map(async (i) => (await cards.nth(i).boundingBox())!),
    )
    // All three cards share roughly the same y (top within ~4px of each other)
    const ys = boxes.map((b) => b.y)
    const yMin = Math.min(...ys)
    const yMax = Math.max(...ys)
    expect(yMax - yMin).toBeLessThan(8)
  })

  test('does not include any <audio> element', async ({ page }) => {
    await page.goto('/diagnostic')
    const audioCount = await page.locator('audio').count()
    expect(audioCount).toBe(0)
  })

  // MOCK-010 â€” dismiss button and tÃ¢che accent bars
  test('clicking the Ã— dismiss button removes the past-score panel', async ({ page }) => {
    await page.goto('/diagnostic')
    await expect(page.getByTestId('diagnostic-past-score')).toBeVisible()
    await page.getByTestId('past-score-dismiss').click()
    await expect(page.getByTestId('diagnostic-past-score')).not.toBeAttached()
  })

  test('tÃ¢che cards each have an accent bar element', async ({ page }) => {
    await page.goto('/diagnostic')
    const cards = page.getByTestId('tache-card')
    await expect(cards).toHaveCount(3)
    for (let i = 0; i < 3; i++) {
      await expect(cards.nth(i).getByTestId('tache-card-accent-bar')).toBeVisible()
    }
  })
})

test.describe('Le Diagnostic landing â€” mobile (375Ã—667)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('3 tÃ¢che cards stack vertically on mobile', async ({ page }) => {
    await page.goto('/diagnostic')
    const cards = page.getByTestId('tache-card')
    await expect(cards).toHaveCount(3)
    const boxes = await Promise.all(
      [0, 1, 2].map(async (i) => (await cards.nth(i).boundingBox())!),
    )
    // Each subsequent card sits below the previous one
    expect(boxes[1].y).toBeGreaterThan(boxes[0].y + boxes[0].height - 2)
    expect(boxes[2].y).toBeGreaterThan(boxes[1].y + boxes[1].height - 2)
  })

  test('no horizontal overflow on /diagnostic', async ({ page }) => {
    await page.goto('/diagnostic')
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const clientWidth = await page.evaluate(() => document.body.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })

  test('primary CTA remains visible on mobile', async ({ page }) => {
    await page.goto('/diagnostic')
    await expect(page.getByTestId('diagnostic-cta-start')).toBeVisible()
  })
})
