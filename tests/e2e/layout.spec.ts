import { test, expect } from '@playwright/test'

test.describe('PWA + layout meta', () => {
  test('manifest link is present in <head>', async ({ page }) => {
    await page.goto('/')
    const manifestLink = page.locator('link[rel="manifest"]')
    await expect(manifestLink).toHaveCount(1)
    const href = await manifestLink.getAttribute('href')
    expect(href).toBe('/manifest.json')
  })

  test('manifest.json is reachable and returns valid JSON', async ({ page }) => {
    const response = await page.goto('/manifest.json')
    expect(response?.status()).toBe(200)
    const body = await response?.text()
    expect(() => JSON.parse(body ?? '')).not.toThrow()
    const json = JSON.parse(body ?? '')
    expect(json.name).toBeTruthy()
    expect(json.start_url).toBe('/')
    expect(json.display).toBe('standalone')
  })

  test('theme-color meta tag is present', async ({ page }) => {
    await page.goto('/')
    const meta = page.locator('meta[name="theme-color"]')
    await expect(meta).toHaveCount(1)
    const content = await meta.getAttribute('content')
    expect(content).toBeTruthy()
    expect(content!.startsWith('#')).toBe(true)
  })

  test('viewport meta includes viewport-fit=cover', async ({ page }) => {
    await page.goto('/')
    const meta = page.locator('meta[name="viewport"]')
    await expect(meta).toHaveCount(1)
    const content = await meta.getAttribute('content')
    expect(content).toContain('viewport-fit=cover')
  })

  test('icon-192.png is reachable', async ({ page }) => {
    const response = await page.goto('/icons/icon-192.png')
    expect(response?.status()).toBe(200)
  })

  test('icon-512.png is reachable', async ({ page }) => {
    const response = await page.goto('/icons/icon-512.png')
    expect(response?.status()).toBe(200)
  })
})
