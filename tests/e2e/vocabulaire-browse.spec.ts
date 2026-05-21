import { test, expect } from '@playwright/test'

test.describe('Le Vocabulaire browse — desktop (1280×800)', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('renders page header inside the (app) shell with filter bar and 30 chunks', async ({
    page,
  }) => {
    await page.goto('/vocabulaire')
    await expect(page.getByTestId('app-shell-sidebar')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1, name: /le vocabulaire/i })).toBeVisible()
    await expect(page.getByText(/les chunks qui font la différence\./i)).toBeVisible()
    await expect(page.getByTestId('vocab-filter-bar')).toBeVisible()
    await expect(page.getByTestId('chunk-row')).toHaveCount(30)
  })

  test('shows Le Vocabulaire as active in the sidebar', async ({ page }) => {
    await page.goto('/vocabulaire')
    await expect(page.getByTestId('sidebar-link-vocabulaire')).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  test('deselecting A1 chip filters out A1 rows', async ({ page }) => {
    await page.goto('/vocabulaire')
    await page.getByTestId('cefr-chip-A1').click()
    await expect(page.getByTestId('chunk-row')).toHaveCount(24)
    const rows = await page.getByTestId('chunk-row').all()
    for (const row of rows) {
      await expect(row).not.toHaveAttribute('data-chunk-level', 'A1')
    }
  })

  test('selecting source "Média" filters to Média rows only', async ({ page }) => {
    await page.goto('/vocabulaire')
    await page.getByTestId('source-select').selectOption('Média')
    const rows = await page.getByTestId('chunk-row').all()
    expect(rows.length).toBeGreaterThan(0)
    for (const row of rows) {
      await expect(row).toHaveAttribute('data-chunk-source', 'Média')
    }
  })

  test('search "tomber" filters to chunks containing tomber (case-insensitive)', async ({
    page,
  }) => {
    await page.goto('/vocabulaire')
    await page.getByTestId('search-input').fill('tomber')
    const rows = page.getByTestId('chunk-row')
    const count = await rows.count()
    expect(count).toBeGreaterThan(0)
    for (let i = 0; i < count; i++) {
      const fr = await rows.nth(i).getByTestId('chunk-row-fr').textContent()
      expect(fr?.toLowerCase()).toContain('tomber')
    }
  })

  test('empty filter combination shows empty state + reset button', async ({ page }) => {
    await page.goto('/vocabulaire')
    await page.getByTestId('cefr-chip-A2').click()
    await page.getByTestId('cefr-chip-B1').click()
    await page.getByTestId('cefr-chip-B2').click()
    await page.getByTestId('cefr-chip-C1').click()
    await page.getByTestId('source-select').selectOption('Média')

    await expect(page.getByTestId('chunk-row')).toHaveCount(0)
    await expect(page.getByTestId('vocab-empty-state')).toBeVisible()
    await page.getByTestId('vocab-empty-reset').click()
    await expect(page.getByTestId('chunk-row')).toHaveCount(30)
  })
})

test.describe('Le Vocabulaire browse — mobile (375×667)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('filter bar collapses behind a "Filtres" button on mobile', async ({ page }) => {
    await page.goto('/vocabulaire')
    const filtresButton = page.getByTestId('vocab-mobile-filters-toggle')
    await expect(filtresButton).toBeVisible()
    // Filter chips are NOT visible before opening
    await expect(page.getByTestId('cefr-chip-A1')).toBeHidden()
    await filtresButton.click()
    await expect(page.getByTestId('cefr-chip-A1')).toBeVisible()
  })

  test('no horizontal overflow on /vocabulaire', async ({ page }) => {
    await page.goto('/vocabulaire')
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const clientWidth = await page.evaluate(() => document.body.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })

  test('all 30 chunk rows render on mobile (scrollable)', async ({ page }) => {
    await page.goto('/vocabulaire')
    await expect(page.getByTestId('chunk-row')).toHaveCount(30)
  })
})
