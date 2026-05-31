import { test, expect } from '@playwright/test'
import { injectAuthToken } from '../helpers/auth-e2e'

test.beforeEach(async ({ page }) => {
  await injectAuthToken(page)
})


test.describe('Le Diagnostic tâche shell — desktop (1280×800)', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('renders all elements on /l-examen/diagnostic/tache/1', async ({ page }) => {
    await page.goto('/l-examen/diagnostic/tache/1')
    await expect(page.getByTestId('app-shell-sidebar')).toBeVisible()
    await expect(page.getByTestId('breadcrumb')).toBeVisible()
    await expect(page.getByTestId('tache-shell-title')).toBeVisible()
    await expect(page.getByTestId('timer-display')).toContainText('03:00')
    await expect(page.getByTestId('tache-shell-prompt')).toBeVisible()
    await expect(page.getByTestId('recording-placeholder')).toBeVisible()
    await expect(page.getByTestId('recording-mic-btn')).toBeVisible()
    await expect(page.getByTestId('tache-nav-next')).toBeVisible()
    await expect(page.getByTestId('tache-nav-prev')).toBeHidden()
  })

  test('sidebar shows Le Diagnostic as active on tâche route', async ({ page }) => {
    await page.goto('/l-examen/diagnostic/tache/1')
    await expect(page.getByTestId('sidebar-link-l-examen')).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  test('timer initialises to 03:30 on tâche 2', async ({ page }) => {
    await page.goto('/l-examen/diagnostic/tache/2')
    await expect(page.getByTestId('timer-display')).toContainText('03:30')
  })

  test('timer initialises to 05:00 on tâche 3', async ({ page }) => {
    await page.goto('/l-examen/diagnostic/tache/3')
    await expect(page.getByTestId('timer-display')).toContainText('05:00')
  })

  test('"Tâche suivante" link navigates to /l-examen/tache/2', async ({ page }) => {
    await page.goto('/l-examen/diagnostic/tache/1')
    await page.getByTestId('tache-nav-next').click()
    await expect(page).toHaveURL(/\/l-examen\/tache\/2$/)
  })

  test('tâche 3 shows "Voir les résultats" linking to /l-examen/diagnostic/results', async ({
    page,
  }) => {
    await page.goto('/l-examen/diagnostic/tache/3')
    const link = page.getByTestId('tache-nav-results')
    await expect(link).toHaveAttribute('href', '/l-examen/diagnostic/results')
    await expect(link).toContainText(/voir les résultats/i)
    await expect(page.getByTestId('tache-nav-next')).toBeHidden()
  })

  test('/l-examen/diagnostic/tache/4 returns 404', async ({ page }) => {
    const response = await page.goto('/l-examen/diagnostic/tache/4')
    expect(response?.status()).toBe(404)
  })

  test('mic button cycles: Idle → Recording → Stopped', async ({ page }) => {
    await page.goto('/l-examen/diagnostic/tache/1')
    // Idle state
    await expect(page.getByTestId('recording-status')).toContainText(
      /cliquez pour commencer/i,
    )
    // → Recording
    await page.getByTestId('recording-mic-btn').click()
    await expect(page.getByTestId('recording-status')).toContainText(
      /enregistrement en cours/i,
    )
    // → Stopped
    await page.getByTestId('recording-mic-btn').click()
    await expect(page.getByTestId('recording-status')).toContainText(
      /enregistrement terminé/i,
    )
    await expect(page.getByTestId('recording-recommencer')).toBeVisible()
  })

  test('does not contain any <audio> element', async ({ page }) => {
    await page.goto('/l-examen/diagnostic/tache/1')
    expect(await page.locator('audio').count()).toBe(0)
  })

  // MOCK-010 — timer urgency, ripple rings, reduced-motion
  test('timer display gets urgency class when running and < 60s remaining', async ({ page }) => {
    await page.clock.install()
    await page.goto('/l-examen/diagnostic/tache/1') // 180s timer
    await page.getByTestId('timer-toggle').click()
    await page.clock.fastForward(121_000) // → 59s remaining
    await expect(page.getByTestId('timer-display')).toHaveClass(/timer-urgency/)
  })

  test('recording state shows 2 ripple ring elements', async ({ page }) => {
    await page.goto('/l-examen/diagnostic/tache/1')
    await page.getByTestId('recording-mic-btn').click()
    await expect(page.getByTestId('recording-ripple')).toHaveCount(2)
  })

  test('ripple rings absent when prefers-reduced-motion is set', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' })
    const page = await context.newPage()
    await page.goto('/l-examen/diagnostic/tache/1')
    await page.getByTestId('recording-mic-btn').click()
    await expect(page.getByTestId('recording-ripple')).toHaveCount(0)
    await context.close()
  })
})

test.describe('Le Diagnostic tâche shell — mobile (375×667)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('mic button has at least 88×88px tap target on mobile', async ({ page }) => {
    await page.goto('/l-examen/diagnostic/tache/1')
    const box = await page.getByTestId('recording-mic-btn').boundingBox()
    expect(box).not.toBeNull()
    expect(box!.width).toBeGreaterThanOrEqual(88)
    expect(box!.height).toBeGreaterThanOrEqual(88)
  })

  test('no horizontal overflow on tâche route', async ({ page }) => {
    await page.goto('/l-examen/diagnostic/tache/1')
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const clientWidth = await page.evaluate(() => document.body.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })

  test('all key elements are visible on mobile', async ({ page }) => {
    await page.goto('/l-examen/diagnostic/tache/1')
    await expect(page.getByTestId('tache-shell-title')).toBeVisible()
    await expect(page.getByTestId('timer-display')).toBeVisible()
    await expect(page.getByTestId('recording-mic-btn')).toBeVisible()
  })
})
