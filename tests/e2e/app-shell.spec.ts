import { test, expect } from '@playwright/test'
import { injectAuthToken } from '../helpers/auth-e2e'

test.beforeEach(async ({ page }) => {
  await injectAuthToken(page)
})

test.describe('App shell — desktop (1280×800)', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  // F-473 — the CH avatar is retired. The rail rests collapsed on desktop and
  // shows the square brand mark; it must actually decode (F-461 no-404 lesson).
  test('sidebar shows the brand mark (collapsed rail) and it loads', async ({ page }) => {
    await page.goto('/tableau-de-bord')
    const mark = page.getByTestId('sidebar-mark-img')
    await expect(mark).toBeVisible()
    await expect(page.getByTestId('sidebar-mark')).toHaveAttribute('href', '/tableau-de-bord')
    // Poll until the bytes finish decoding (not just layout-visible) — the real
    // "loaded, not 404" gate (F-461 lesson) without a load-timing race.
    await expect
      .poll(() => mark.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0))
      .toBe(true)
  })

  // F-455 — legacy left-tab replaced by the active pill on the link itself.
  test('active link renders the active pill (no legacy left-tab)', async ({ page }) => {
    await page.goto('/tableau-de-bord')
    await expect(page.getByTestId('sidebar-link-tableau-de-bord')).toHaveAttribute('data-active', 'true')
    await expect(page.getByTestId('sidebar-active-tab')).toHaveCount(0)
  })

  test('navigating tableau-de-bord→la-methode shifts active state', async ({ page }) => {
    await page.goto('/tableau-de-bord')
    await expect(page.getByTestId('sidebar-link-tableau-de-bord')).toHaveAttribute('aria-current', 'page')
    await page.getByTestId('sidebar-link-la-methode').click()
    await expect(page).toHaveURL(/\/la-methode/)
    await expect(page.getByTestId('sidebar-link-la-methode')).toHaveAttribute('aria-current', 'page')
    await expect(page.getByTestId('sidebar-link-tableau-de-bord')).not.toHaveAttribute('aria-current', /.+/)
  })

  test('shell renders on /tableau-de-bord with sidebar: 5 core links + revenue section (F-447)', async ({ page }) => {
    await page.goto('/tableau-de-bord')
    await expect(page.getByTestId('app-shell-sidebar')).toBeVisible()
    // Core nav (5 links — La Bibliothèque removed in F-447)
    await expect(page.getByTestId('sidebar-link-seance')).toBeVisible()
    await expect(page.getByTestId('sidebar-link-tableau-de-bord')).toBeVisible()
    await expect(page.getByTestId('sidebar-link-la-methode')).toBeVisible()
    await expect(page.getByTestId('sidebar-link-l-examen')).toBeVisible()
    await expect(page.getByTestId('sidebar-link-profil')).toBeVisible()
    // Revenue section (F-447)
    await expect(page.getByTestId('sidebar-link-librairie')).toBeVisible()
    await expect(page.getByTestId('sidebar-link-tarifs')).toBeVisible()
    await expect(page.getByTestId('sidebar-link-coaching')).toBeVisible()
  })

  test('hamburger button is hidden on desktop', async ({ page }) => {
    await page.goto('/tableau-de-bord')
    await expect(page.getByTestId('app-shell-hamburger')).toBeHidden()
  })

  test('active state is on "Tableau de bord" when visiting /tableau-de-bord', async ({ page }) => {
    await page.goto('/tableau-de-bord')
    await expect(page.getByTestId('sidebar-link-tableau-de-bord')).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(page.getByTestId('sidebar-link-profil')).not.toHaveAttribute(
      'aria-current',
      /.+/,
    )
  })

  test('clicking "Compte" navigates to /profil and active state shifts', async ({ page }) => {
    await page.goto('/tableau-de-bord')
    await page.getByTestId('sidebar-link-profil').click()
    await expect(page).toHaveURL(/\/profil$/)
    await expect(page.getByTestId('sidebar-link-profil')).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(page.getByTestId('sidebar-link-tableau-de-bord')).not.toHaveAttribute(
      'aria-current',
      /.+/,
    )
  })

  test('shell wraps the /profil page', async ({ page }) => {
    await page.goto('/profil')
    await expect(page.getByTestId('app-shell-sidebar')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1, name: /profile/i })).toBeVisible()
  })

  test('shell wraps the /tableau-de-bord page with a heading', async ({ page }) => {
    await page.goto('/tableau-de-bord')
    await expect(page.getByRole('heading', { level: 1, name: /bonjour/i })).toBeVisible()
  })
})

test.describe('App shell — mobile (375×667)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('hamburger is visible and sidebar starts closed', async ({ page }) => {
    await page.goto('/tableau-de-bord')
    await expect(page.getByTestId('app-shell-hamburger')).toBeVisible()
    await expect(page.getByTestId('app-shell-sidebar')).toHaveAttribute(
      'data-drawer-open',
      'false',
    )
    expect(await page.getByTestId('app-shell-backdrop').count()).toBe(0)
  })

  test('hamburger click opens drawer with core links, revenue section, and backdrop (F-447)', async ({ page }) => {
    await page.goto('/tableau-de-bord')
    await page.getByTestId('app-shell-hamburger').click()
    await expect(page.getByTestId('app-shell-sidebar')).toHaveAttribute(
      'data-drawer-open',
      'true',
    )
    await expect(page.getByTestId('app-shell-backdrop')).toBeVisible()
    // Core nav (5 links — La Bibliothèque removed in F-447)
    await expect(page.getByTestId('sidebar-link-seance')).toBeVisible()
    await expect(page.getByTestId('sidebar-link-tableau-de-bord')).toBeVisible()
    await expect(page.getByTestId('sidebar-link-la-methode')).toBeVisible()
    await expect(page.getByTestId('sidebar-link-l-examen')).toBeVisible()
    await expect(page.getByTestId('sidebar-link-profil')).toBeVisible()
    // Revenue section (F-447)
    await expect(page.getByTestId('sidebar-link-librairie')).toBeVisible()
    await expect(page.getByTestId('sidebar-link-tarifs')).toBeVisible()
    await expect(page.getByTestId('sidebar-link-coaching')).toBeVisible()
  })

  test('backdrop click closes the drawer', async ({ page }) => {
    await page.goto('/tableau-de-bord')
    await page.getByTestId('app-shell-hamburger').click()
    // Click the darkened backdrop area to the right of the 240px-wide sidebar.
    await page.getByTestId('app-shell-backdrop').click({ position: { x: 300, y: 400 } })
    await expect(page.getByTestId('app-shell-sidebar')).toHaveAttribute(
      'data-drawer-open',
      'false',
    )
  })

  test('clicking a nav link inside the drawer navigates and closes the drawer', async ({
    page,
  }) => {
    await page.goto('/tableau-de-bord')
    await page.getByTestId('app-shell-hamburger').click()
    await page.getByTestId('sidebar-link-profil').click()
    await expect(page).toHaveURL(/\/profil$/)
    await expect(page.getByTestId('app-shell-sidebar')).toHaveAttribute(
      'data-drawer-open',
      'false',
    )
  })

  test('no horizontal overflow on /tableau-de-bord', async ({ page }) => {
    await page.goto('/tableau-de-bord')
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const clientWidth = await page.evaluate(() => document.body.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })

  // MOCK-006 — drawer transition property
  test('sidebar has 300ms transform transition', async ({ page }) => {
    await page.goto('/tableau-de-bord')
    await page.getByTestId('app-shell-hamburger').click()
    const transition = await page.getByTestId('app-shell-sidebar').evaluate(
      (el) => window.getComputedStyle(el).transition,
    )
    // Browsers normalize 300ms → 0.3s in computed styles
    expect(transition).toMatch(/0\.3s|300ms/)
  })
})
