import { test, expect } from '@playwright/test'
import { injectAuthToken } from '../helpers/auth-e2e'

// F-465 — persistent icon-rail sidebar that expands to titles on hover/focus,
// pins to keep titles (localStorage), pushes content right on desktop, and
// falls back to the overlay drawer on mobile. Assertions read the rendered
// geometry/state, not src attributes (the F-461 weak-assertion lesson).

test.beforeEach(async ({ page }) => {
  await injectAuthToken(page)
})

const RAIL = 64
const EXPANDED = 240

test.describe('F-465 — icon-rail (desktop 1280×800)', () => {
  // Pin a fine pointer so this block is deterministic even when the suite runs
  // under the `mobile` project (which sets isMobile globally). The rail model
  // is gated on (hover:hover) and (pointer:fine).
  test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false })

  test('rail renders icon-only at rest and pushes content by the rail width', async ({ page }) => {
    await page.goto('/tableau-de-bord')
    const sidebar = page.getByTestId('app-shell-sidebar')
    await expect(sidebar).toBeVisible()
    // Resting: icons mode, collapsed, content pushed by the rail footprint.
    await expect(sidebar).toHaveAttribute('data-expanded', 'false')
    const railWidth = await sidebar.evaluate((el) => el.getBoundingClientRect().width)
    expect(railWidth).toBeLessThan(RAIL) // floated panel = footprint − inset
    const mainOffset = await page
      .getByRole('main')
      .evaluate((el) => parseInt(getComputedStyle(el).marginLeft, 10))
    expect(mainOffset).toBe(RAIL)
    // No desktop hamburger / toggle.
    await expect(page.getByTestId('app-shell-hamburger')).toBeHidden()
  })

  test('hover expands the rail to titles and pushes content to the expanded width', async ({ page }) => {
    await page.goto('/tableau-de-bord')
    const sidebar = page.getByTestId('app-shell-sidebar')
    await sidebar.hover()
    await expect(sidebar).toHaveAttribute('data-expanded', 'true')
    await expect
      .poll(async () => sidebar.evaluate((el) => Math.round(el.getBoundingClientRect().width)))
      .toBeGreaterThan(EXPANDED - 40)
    await expect
      .poll(async () =>
        page.getByRole('main').evaluate((el) => parseInt(getComputedStyle(el).marginLeft, 10)),
      )
      .toBe(EXPANDED)
  })

  test('keyboard focus expands the rail (a11y parity)', async ({ page }) => {
    await page.goto('/tableau-de-bord')
    const sidebar = page.getByTestId('app-shell-sidebar')
    await expect(sidebar).toHaveAttribute('data-expanded', 'false')
    await page.getByTestId('sidebar-link-seance').focus()
    await expect(sidebar).toHaveAttribute('data-expanded', 'true')
  })

  test('pin persists "titles" across reload via localStorage', async ({ page }) => {
    await page.goto('/tableau-de-bord')
    const sidebar = page.getByTestId('app-shell-sidebar')
    await sidebar.hover()
    const pin = page.getByTestId('sidebar-pin')
    await expect(pin).toBeVisible()
    await expect(pin).toHaveAttribute('aria-pressed', 'false')
    await pin.click()
    await expect(pin).toHaveAttribute('aria-pressed', 'true')
    expect(await page.evaluate(() => localStorage.getItem('lm.sidebarMode.v1'))).toBe('titles')

    // Reload: pinned-expanded on load, content stays pushed, hover not required.
    await page.reload()
    const sidebar2 = page.getByTestId('app-shell-sidebar')
    await expect(sidebar2).toHaveAttribute('data-mode', 'titles')
    await expect(sidebar2).toHaveAttribute('data-expanded', 'true')
    await expect
      .poll(async () =>
        page.getByRole('main').evaluate((el) => parseInt(getComputedStyle(el).marginLeft, 10)),
      )
      .toBe(EXPANDED)

    // Unpin returns to the icons-at-rest hover model.
    await page.getByTestId('sidebar-pin').click()
    await expect(page.getByTestId('app-shell-sidebar')).toHaveAttribute('data-mode', 'icons')
    expect(await page.evaluate(() => localStorage.getItem('lm.sidebarMode.v1'))).toBe('icons')
  })

  test('active-route indicator reads in the collapsed rail state', async ({ page }) => {
    await page.goto('/tableau-de-bord')
    const active = page.getByTestId('sidebar-link-tableau-de-bord')
    await expect(active).toHaveAttribute('data-active', 'true')
    await expect(active).toHaveAttribute('aria-current', 'page')
    // The active pill paints even while collapsed (non-transparent background).
    const bg = await active.evaluate((el) => getComputedStyle(el).backgroundColor)
    expect(bg).not.toBe('rgba(0, 0, 0, 0)')
  })

  test('F-465 captures — desktop 1440', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/tableau-de-bord')
    await expect(page.getByTestId('app-shell-sidebar')).toBeVisible()
    await page.screenshot({ path: 'tests/screenshots/f-465-rail-1440.png' })
    await page.getByTestId('app-shell-sidebar').hover()
    await expect(page.getByTestId('app-shell-sidebar')).toHaveAttribute('data-expanded', 'true')
    await page.screenshot({ path: 'tests/screenshots/f-465-rail-expanded-1440.png' })
  })
})

test.describe('F-465 — drawer (mobile 375×667)', () => {
  test.use({ viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true })

  test('mobile toggle opens the overlay drawer with titles; no pin', async ({ page }) => {
    await page.goto('/tableau-de-bord')
    // Coarse pointer: drawer model. Toggle is the only trigger.
    await expect(page.getByTestId('app-shell-hamburger')).toBeVisible()
    await expect(page.getByTestId('app-shell-sidebar')).toHaveAttribute('data-drawer-open', 'false')

    await page.getByTestId('app-shell-hamburger').click()
    await expect(page.getByTestId('app-shell-sidebar')).toHaveAttribute('data-drawer-open', 'true')
    await expect(page.getByTestId('app-shell-backdrop')).toBeVisible()
    // Full titles in the drawer.
    await expect(page.getByTestId('sidebar-link-seance')).toBeVisible()
    await expect(page.getByTestId('sidebar-wordmark')).toBeVisible()
    // Pin is a desktop-only affordance — hidden in the drawer.
    await expect(page.getByTestId('sidebar-pin')).toHaveCount(0)

    // Esc dismisses... and backdrop tap-out dismisses.
    await page.getByTestId('app-shell-backdrop').click({ position: { x: 340, y: 500 } })
    await expect(page.getByTestId('app-shell-sidebar')).toHaveAttribute('data-drawer-open', 'false')
  })

  test('F-465 captures — mobile 375 (drawer open)', async ({ page }) => {
    await page.goto('/tableau-de-bord')
    await page.screenshot({ path: 'tests/screenshots/f-465-rail-375.png' })
    await page.getByTestId('app-shell-hamburger').click()
    await expect(page.getByTestId('app-shell-sidebar')).toHaveAttribute('data-drawer-open', 'true')
    await page.screenshot({ path: 'tests/screenshots/f-465-drawer-375.png' })
  })
})
