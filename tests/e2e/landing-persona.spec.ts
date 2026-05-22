import { test, expect } from '@playwright/test'

test.describe('PersonaMatch section — desktop (1280×800)', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('three columns render side-by-side', async ({ page }) => {
    await page.goto('/')
    const columns = page.getByTestId('persona-column')
    await columns.first().scrollIntoViewIfNeeded()
    await expect(columns).toHaveCount(3)

    const b0 = await columns.nth(0).boundingBox()
    const b1 = await columns.nth(1).boundingBox()
    const b2 = await columns.nth(2).boundingBox()
    expect(b0).toBeTruthy()
    expect(b1).toBeTruthy()
    expect(b2).toBeTruthy()
    // Same row: top edges within 10px of each other
    expect(Math.abs(b0!.y - b1!.y)).toBeLessThan(10)
    expect(Math.abs(b1!.y - b2!.y)).toBeLessThan(10)
    // Horizontally separated by at least 50px
    expect(b1!.x).toBeGreaterThan(b0!.x + 50)
    expect(b2!.x).toBeGreaterThan(b1!.x + 50)
  })

  test('section h2 is visible after scrolling', async ({ page }) => {
    await page.goto('/')
    const heading = page.getByRole('heading', { level: 2, name: /visa-urgent/i })
    await heading.scrollIntoViewIfNeeded()
    await expect(heading).toBeVisible()
  })

  // MOCK-003 — editorial icons visible on desktop
  test('persona icons 1-3 are visible after scrolling', async ({ page }) => {
    await page.goto('/')
    for (let n = 1; n <= 3; n++) {
      const icon = page.getByTestId(`persona-icon-${n}`)
      await icon.scrollIntoViewIfNeeded()
      await expect(icon).toBeVisible()
    }
  })

  // MOCK-003 — reduced-motion: columns visible at opacity 1, no entrance animation
  test('persona columns visible at full opacity under reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    const cols = page.getByTestId('persona-column')
    await cols.first().scrollIntoViewIfNeeded()
    for (let i = 0; i < 3; i++) {
      await expect(cols.nth(i)).toBeVisible()
      const opacity = await cols.nth(i).evaluate((el) =>
        parseFloat(window.getComputedStyle(el).opacity)
      )
      expect(opacity).toBeGreaterThan(0.9)
    }
  })
})

test.describe('PersonaMatch section — mobile (375×667)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('columns stack vertically', async ({ page }) => {
    await page.goto('/')
    const columns = page.getByTestId('persona-column')
    await columns.first().scrollIntoViewIfNeeded()
    await expect(columns).toHaveCount(3)

    const b0 = await columns.nth(0).boundingBox()
    const b1 = await columns.nth(1).boundingBox()
    const b2 = await columns.nth(2).boundingBox()
    expect(b0).toBeTruthy()
    expect(b1).toBeTruthy()
    expect(b2).toBeTruthy()
    // Stacked: each column's top is below the previous column's midpoint
    expect(b1!.y).toBeGreaterThan(b0!.y + b0!.height * 0.5)
    expect(b2!.y).toBeGreaterThan(b1!.y + b1!.height * 0.5)
    // All columns share the same left edge (within 10px)
    expect(Math.abs(b0!.x - b1!.x)).toBeLessThan(10)
    expect(Math.abs(b1!.x - b2!.x)).toBeLessThan(10)
  })
})
