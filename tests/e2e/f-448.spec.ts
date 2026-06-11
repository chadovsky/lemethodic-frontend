// F-448 -- Store mold at /librairie (UI only, checkout stubbed).
// Acceptance:
//   Catalog renders placeholder books; category filter works.
//   Detail page per book; Add to cart works.
//   Cart: add/remove/qty/total correct; persists across reload; badge in
//     both shells (logged-out TopNav + logged-in sidebar).
//   Checkout button present and bientôt-stubbed.
// F-225 screenshots: f-448-catalog-{1440,375}.png, f-448-detail-{1440,375}.png,
//                    f-448-cart-1440.png.
//
// Cart-badge visibility choice: the cart icon is ALWAYS present in each shell;
// the numeric count badge appears only when the cart is non-empty.

import { test, expect } from '@playwright/test'
import { injectAuthToken } from '../helpers/auth-e2e'
import * as path from 'path'
import * as fs from 'fs'

const SCREENSHOT_DIR = path.join(__dirname, '../screenshots')
function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

const CATALOG = '/librairie'
const BOOK = 'grammaire-essentielle-b2'
const DETAIL = `/librairie/${BOOK}`

// A seeded cart line so shell-badge assertions are deterministic.
const SEED_CART = [
  {
    id: 'prod_lm_0001',
    slug: BOOK,
    title: 'Grammaire essentielle B2',
    priceCents: 2490,
    currency: 'EUR',
    qty: 2,
  },
]

async function seedCart(page: import('@playwright/test').Page) {
  await page.addInitScript((items) => {
    localStorage.setItem('lemethodic_cart', JSON.stringify(items))
  }, SEED_CART)
}

// ---------------------------------------------------------------------------
// Catalog (desktop 1440)
// ---------------------------------------------------------------------------
test.describe('F-448 -- Catalog (desktop 1440)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('catalog renders placeholder books in a grid', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto(CATALOG)
    await expect(page.getByTestId('catalog-grid')).toBeVisible()
    // 11 seeded placeholder books across the four categories.
    await expect(page.locator('[data-testid^="book-card-"]')).toHaveCount(11)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-448-catalog-1440.png'), fullPage: false })
  })

  test('category filter narrows the grid', async ({ page }) => {
    await page.goto(CATALOG)
    await page.getByTestId('filter-chip-audio').click()
    // 3 audio titles; livres card no longer in the DOM.
    await expect(page.locator('[data-testid^="book-card-"]')).toHaveCount(3)
    await expect(page.getByTestId('book-card-phonetique-en-30-jours')).toBeVisible()
    await expect(page.getByTestId(`book-card-${BOOK}`)).toHaveCount(0)
    // Back to all.
    await page.getByTestId('filter-chip-all').click()
    await expect(page.locator('[data-testid^="book-card-"]')).toHaveCount(11)
  })

  test('clicking a book card navigates to its detail page', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto(CATALOG)
    await page.getByTestId(`book-card-${BOOK}`).click()
    // Generous timeout: in dev the [slug] route compiles on first visit.
    await expect(page).toHaveURL(new RegExp(`/librairie/${BOOK}$`), { timeout: 15000 })
    await expect(page.getByTestId('detail-price')).toBeVisible()
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-448-detail-1440.png'), fullPage: false })
  })
})

// ---------------------------------------------------------------------------
// Detail + cart flow (desktop 1440)
// ---------------------------------------------------------------------------
test.describe('F-448 -- Detail + cart (desktop 1440)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('add to cart opens the drawer with the line and total', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto(DETAIL)
    await page.getByTestId('add-to-cart').click()

    const drawer = page.getByTestId('cart-drawer')
    await expect(drawer).toBeVisible()
    await expect(page.getByTestId(`cart-line-${BOOK}`)).toBeVisible()
    await expect(page.getByTestId(`cart-qty-${BOOK}`)).toHaveText('1')
    await expect(page.getByTestId('cart-total')).toHaveText('24,90 €')
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-448-cart-1440.png'), fullPage: false })
  })

  test('quantity increment updates qty and total', async ({ page }) => {
    await page.goto(DETAIL)
    await page.getByTestId('add-to-cart').click()
    await page.getByTestId(`cart-qty-inc-${BOOK}`).click()
    await expect(page.getByTestId(`cart-qty-${BOOK}`)).toHaveText('2')
    await expect(page.getByTestId('cart-total')).toHaveText('49,80 €')
  })

  test('remove empties the cart', async ({ page }) => {
    await page.goto(DETAIL)
    await page.getByTestId('add-to-cart').click()
    await page.getByTestId(`cart-remove-${BOOK}`).click()
    await expect(page.getByTestId(`cart-line-${BOOK}`)).toHaveCount(0)
    await expect(page.getByTestId('cart-empty')).toBeVisible()
  })

  test('checkout button present and bientôt-stubbed', async ({ page }) => {
    await page.goto(DETAIL)
    await page.getByTestId('add-to-cart').click()
    const stub = page.getByTestId('cart-checkout-stub')
    await expect(stub).toBeVisible()
    await expect(stub).toHaveText('Passer la commande')
    // Wrapped in the Bientôt pattern -> the bientôt pill is present.
    await expect(page.getByTestId('cart-drawer').getByTestId('bientot-pill')).toBeVisible()
  })

  test('cart persists across reload', async ({ page }) => {
    await page.goto(DETAIL)
    await page.getByTestId('add-to-cart').click()
    await expect(page.getByTestId(`cart-line-${BOOK}`)).toBeVisible()

    await page.reload()
    // Drawer is closed after reload; the badge reflects the persisted line.
    await expect(page.getByTestId('store-cart-button-badge')).toHaveText('1')
    // Reopen and confirm the line survived.
    await page.getByTestId('store-cart-button').click()
    await expect(page.getByTestId(`cart-line-${BOOK}`)).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// Badge visibility in both shells
// ---------------------------------------------------------------------------
test.describe('F-448 -- Cart badge in both shells', () => {
  test('logged-out TopNav shows the cart badge (desktop 1440)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await seedCart(page)
    await page.goto('/la-methode')
    await expect(page.getByTestId('topnav-cart-button')).toBeVisible()
    await expect(page.getByTestId('topnav-cart-button-badge')).toHaveText('2')
  })

  test('logged-in sidebar shows the cart badge (desktop 1440)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await injectAuthToken(page)
    await seedCart(page)
    await page.goto('/tableau-de-bord')
    const sidebar = page.getByTestId('app-shell-sidebar')
    await expect(sidebar).toBeVisible()
    await expect(page.getByTestId('sidebar-cart-button')).toBeVisible()
    await expect(page.getByTestId('sidebar-cart-button-badge')).toHaveText('2')
  })
})

// ---------------------------------------------------------------------------
// Mobile (375)
// ---------------------------------------------------------------------------
test.describe('F-448 -- Mobile (375)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('catalog screenshot at 375', async ({ page }) => {
    ensureDir(SCREENSHOT_DIR)
    await page.goto(CATALOG)
    await expect(page.getByTestId('catalog-grid')).toBeVisible()
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-448-catalog-375.png'), fullPage: false })
  })

  test('detail screenshot at 375 and add-to-cart works', async ({ page }) => {
    await page.goto(DETAIL)
    await expect(page.getByTestId('detail-price')).toBeVisible()
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'f-448-detail-375.png'), fullPage: false })
    await page.getByTestId('add-to-cart').click()
    await expect(page.getByTestId(`cart-line-${BOOK}`)).toBeVisible()
  })
})
