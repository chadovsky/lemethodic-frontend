import { test, expect } from '@playwright/test'
import { injectAuthToken } from '../helpers/auth-e2e'

test.beforeEach(async ({ page }) => {
  await injectAuthToken(page)
})

test.describe('App shell — desktop (1280×800)', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  // MOCK-006 — avatar + active left-tab
  test('sidebar shows CH avatar circle', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByTestId('sidebar-avatar')).toBeVisible()
    await expect(page.getByTestId('sidebar-avatar')).toHaveText('CH')
  })

  test('active link row has left-tab indicator visible', async ({ page }) => {
    await page.goto('/dashboard')
    const tab = page.getByTestId('sidebar-active-tab')
    await expect(tab).toBeVisible()
  })

  test('navigating dashboard→la-methode shifts active state', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByTestId('sidebar-link-dashboard')).toHaveAttribute('aria-current', 'page')
    await page.getByTestId('sidebar-link-la-methode').click()
    await expect(page).toHaveURL(/\/la-methode/)
    await expect(page.getByTestId('sidebar-link-la-methode')).toHaveAttribute('aria-current', 'page')
    await expect(page.getByTestId('sidebar-link-dashboard')).not.toHaveAttribute('aria-current', /.+/)
  })

  test('shell renders on /dashboard with sidebar and 5 nav links', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByTestId('app-shell-sidebar')).toBeVisible()
    await expect(page.getByTestId('sidebar-link-dashboard')).toBeVisible()
    await expect(page.getByTestId('sidebar-link-la-methode')).toBeVisible()
    await expect(page.getByTestId('sidebar-link-la-bibliotheque')).toBeVisible()
    await expect(page.getByTestId('sidebar-link-l-examen')).toBeVisible()
    await expect(page.getByTestId('sidebar-link-account')).toBeVisible()
  })

  test('hamburger button is hidden on desktop', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByTestId('app-shell-hamburger')).toBeHidden()
  })

  test('active state is on "Tableau de bord" when visiting /dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByTestId('sidebar-link-dashboard')).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(page.getByTestId('sidebar-link-account')).not.toHaveAttribute(
      'aria-current',
      /.+/,
    )
  })

  test('clicking "Compte" navigates to /account and active state shifts', async ({ page }) => {
    await page.goto('/dashboard')
    await page.getByTestId('sidebar-link-account').click()
    await expect(page).toHaveURL(/\/account$/)
    await expect(page.getByTestId('sidebar-link-account')).toHaveAttribute(
      'aria-current',
      'page',
    )
    await expect(page.getByTestId('sidebar-link-dashboard')).not.toHaveAttribute(
      'aria-current',
      /.+/,
    )
  })

  test('shell wraps the /account stub page', async ({ page }) => {
    await page.goto('/account')
    await expect(page.getByTestId('app-shell-sidebar')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1, name: /compte/i })).toBeVisible()
  })

  test('shell wraps the /dashboard page with a heading', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByRole('heading', { level: 1, name: /bonjour/i })).toBeVisible()
  })
})

test.describe('App shell — mobile (375×667)', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('hamburger is visible and sidebar starts closed', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.getByTestId('app-shell-hamburger')).toBeVisible()
    await expect(page.getByTestId('app-shell-sidebar')).toHaveAttribute(
      'data-drawer-open',
      'false',
    )
    expect(await page.getByTestId('app-shell-backdrop').count()).toBe(0)
  })

  test('hamburger click opens drawer with 5 nav links and backdrop', async ({ page }) => {
    await page.goto('/dashboard')
    await page.getByTestId('app-shell-hamburger').click()
    await expect(page.getByTestId('app-shell-sidebar')).toHaveAttribute(
      'data-drawer-open',
      'true',
    )
    await expect(page.getByTestId('app-shell-backdrop')).toBeVisible()
    await expect(page.getByTestId('sidebar-link-dashboard')).toBeVisible()
    await expect(page.getByTestId('sidebar-link-la-methode')).toBeVisible()
    await expect(page.getByTestId('sidebar-link-la-bibliotheque')).toBeVisible()
    await expect(page.getByTestId('sidebar-link-l-examen')).toBeVisible()
    await expect(page.getByTestId('sidebar-link-account')).toBeVisible()
  })

  test('backdrop click closes the drawer', async ({ page }) => {
    await page.goto('/dashboard')
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
    await page.goto('/dashboard')
    await page.getByTestId('app-shell-hamburger').click()
    await page.getByTestId('sidebar-link-account').click()
    await expect(page).toHaveURL(/\/account$/)
    await expect(page.getByTestId('app-shell-sidebar')).toHaveAttribute(
      'data-drawer-open',
      'false',
    )
  })

  test('no horizontal overflow on /dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const clientWidth = await page.evaluate(() => document.body.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })

  // MOCK-006 — drawer transition property
  test('sidebar has 300ms transform transition', async ({ page }) => {
    await page.goto('/dashboard')
    await page.getByTestId('app-shell-hamburger').click()
    const transition = await page.getByTestId('app-shell-sidebar').evaluate(
      (el) => window.getComputedStyle(el).transition,
    )
    // Browsers normalize 300ms → 0.3s in computed styles
    expect(transition).toMatch(/0\.3s|300ms/)
  })
})
