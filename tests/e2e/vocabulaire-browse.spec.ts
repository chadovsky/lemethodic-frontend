import { test, expect } from '@playwright/test'
import { injectAuthToken } from '../helpers/auth-e2e'

test.beforeEach(async ({ page }) => {
  await injectAuthToken(page)
})


test.describe('Le Vocabulaire browse â€” desktop (1280Ã—800)', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('renders page header inside the (app) shell with filter bar and 60 chunks', async ({
    page,
  }) => {
    await page.goto('/vocabulaire')
    await expect(page.getByTestId('app-shell-sidebar')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1, name: /le vocabulaire/i })).toBeVisible()
    await expect(page.getByText(/les chunks qui font la diffÃ©rence\./i)).toBeVisible()
    await expect(page.getByTestId('vocab-filter-bar')).toBeVisible()
    await expect(page.getByTestId('chunk-row')).toHaveCount(60)
  })

  test('shows Le Vocabulaire as active in the sidebar', async ({ page }) => {
    await page.goto('/vocabulaire')
    await expect(page.getByTestId('sidebar-link-vocabulaire')).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  test('count badge shows "60 chunks"', async ({ page }) => {
    await page.goto('/vocabulaire')
    await expect(page.getByTestId('vocab-count-badge')).toContainText('60 chunks')
  })

  test('deselecting A1 chip filters out A1 rows', async ({ page }) => {
    await page.goto('/vocabulaire')
    await page.getByTestId('cefr-chip-A1').click()
    await expect(page.getByTestId('chunk-row')).toHaveCount(48)
    const rows = await page.getByTestId('chunk-row').all()
    for (const row of rows) {
      await expect(row).not.toHaveAttribute('data-chunk-level', 'A1')
    }
  })

  test('selecting source "MÃ©dia" filters to MÃ©dia rows only', async ({ page }) => {
    await page.goto('/vocabulaire')
    await page.getByTestId('source-select').selectOption('MÃ©dia')
    const rows = await page.getByTestId('chunk-row').all()
    expect(rows.length).toBeGreaterThan(0)
    for (const row of rows) {
      await expect(row).toHaveAttribute('data-chunk-source', 'MÃ©dia')
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
    await page.getByTestId('source-select').selectOption('MÃ©dia')

    await expect(page.getByTestId('chunk-row')).toHaveCount(0)
    await expect(page.getByTestId('vocab-empty-state')).toBeVisible()
    await page.getByTestId('vocab-empty-reset').click()
    await expect(page.getByTestId('chunk-row')).toHaveCount(60)
  })

  // MOCK-009 â€” save icon toggle, ed-card-lift on rows
  test('clicking save icon toggles data-saved attribute', async ({ page }) => {
    await page.goto('/vocabulaire')
    const saveBtn = page.getByTestId('chunk-row-save').first()
    await expect(saveBtn).toHaveAttribute('data-saved', 'false')
    await saveBtn.click()
    await expect(saveBtn).toHaveAttribute('data-saved', 'true')
    await saveBtn.click()
    await expect(saveBtn).toHaveAttribute('data-saved', 'false')
  })

  test('each ChunkRow has ed-card-lift class', async ({ page }) => {
    await page.goto('/vocabulaire')
    const firstRow = page.getByTestId('chunk-row').first()
    await expect(firstRow).toHaveClass(/ed-card-lift/)
  })
})

test.describe('Le Vocabulaire browse â€” mobile (375Ã—667)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('filter bar collapses behind a "Filtres" button on mobile', async ({ page }) => {
    await page.goto('/vocabulaire')
    const filtresButton = page.getByTestId('vocab-mobile-filters-toggle')
    await expect(filtresButton).toBeVisible()
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

  test('all 60 chunk rows render on mobile (scrollable)', async ({ page }) => {
    await page.goto('/vocabulaire')
    await expect(page.getByTestId('chunk-row')).toHaveCount(60)
  })
})
