import { test, expect } from '@playwright/test'

test.describe('Landing hero — desktop (1280×800)', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('headline and CTA are above the fold', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText("There's a method to French")
    const hero = page.getByRole('region', { name: /hero/i })
    await expect(hero.getByRole('link', { name: /see how it works/i })).toBeVisible()
  })

  test('CTA navigates to /la-methode', async ({ page }) => {
    await page.goto('/')
    const hero = page.getByRole('region', { name: /hero/i })
    await hero.getByRole('link', { name: /see how it works/i }).click()
    await expect(page).toHaveURL(/\/la-methode/, { timeout: 15_000 })
  })

  // Hero subheadline — editorial description visible above the fold
  test('hero subheadline is visible', async ({ page }) => {
    await page.goto('/')
    const sub = page.getByTestId('hero-subheadline')
    await expect(sub).toBeVisible()
    const text = await sub.textContent()
    expect(text).toContain('French')
  })

  // MOCK-001 — Sticky header scroll state
  test('header gains solid background after scrolling 80px', async ({ page }) => {
    await page.goto('/')
    const header = page.getByTestId('sticky-header')
    await expect(header).not.toHaveClass(/sticky-header--scrolled/)
    // Ensure page is tall enough, then scroll past the >60px threshold
    await page.evaluate(() => {
      document.documentElement.style.minHeight = '2000px'
      window.scrollTo(0, 80)
    })
    // Wait for the browser to commit the scroll position before dispatching the event.
    // This avoids the race where scrollTo fires before React's useEffect listener is registered.
    await page.waitForFunction(() => window.scrollY >= 60, { timeout: 3000 })
    // Re-dispatch so the React listener (now guaranteed registered) picks it up
    await page.evaluate(() => window.dispatchEvent(new Event('scroll')))
    await expect(header).toHaveClass(/sticky-header--scrolled/, { timeout: 5000 })
  })
})

test.describe('Landing hero — mobile (375×667)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('no horizontal overflow', async ({ page }) => {
    await page.goto('/')
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const clientWidth = await page.evaluate(() => document.body.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })

  test('headline and CTA visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const hero = page.getByRole('region', { name: /hero/i })
    await expect(hero.getByRole('link', { name: /see how it works/i })).toBeVisible()
  })

  test('CTA tap target is at least 44px tall', async ({ page }) => {
    await page.goto('/')
    const hero = page.getByRole('region', { name: /hero/i })
    const cta = hero.getByRole('link', { name: /see how it works/i })
    const box = await cta.boundingBox()
    expect(box).toBeTruthy()
    expect(box!.height).toBeGreaterThanOrEqual(44)
  })

  // Hero subheadline visible on mobile
  test('hero subheadline is visible on mobile', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('hero-subheadline')).toBeVisible()
  })
})
