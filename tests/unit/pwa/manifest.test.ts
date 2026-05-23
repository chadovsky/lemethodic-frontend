import { describe, expect, it } from 'vitest'
import manifestJson from '../../../public/manifest.json'

const manifest = manifestJson as Record<string, unknown>

describe('PWA manifest', () => {
  it('has a name field', () => {
    expect(typeof manifest.name).toBe('string')
    expect((manifest.name as string).length).toBeGreaterThan(0)
  })

  it('has a short_name field', () => {
    expect(typeof manifest.short_name).toBe('string')
    expect((manifest.short_name as string).length).toBeGreaterThan(0)
  })

  it('has start_url set to "/"', () => {
    expect(manifest.start_url).toBe('/')
  })

  it('display is "standalone"', () => {
    expect(manifest.display).toBe('standalone')
  })

  it('has a theme_color field', () => {
    expect(typeof manifest.theme_color).toBe('string')
    expect((manifest.theme_color as string).startsWith('#')).toBe(true)
  })

  it('has a background_color field', () => {
    expect(typeof manifest.background_color).toBe('string')
    expect((manifest.background_color as string).startsWith('#')).toBe(true)
  })

  it('has icons array with at least 2 entries', () => {
    expect(Array.isArray(manifest.icons)).toBe(true)
    expect((manifest.icons as unknown[]).length).toBeGreaterThanOrEqual(2)
  })

  it('icons include a 192×192 entry', () => {
    const icons = manifest.icons as Array<{ sizes: string; src: string; type: string }>
    expect(icons.some((ic) => ic.sizes === '192x192')).toBe(true)
  })

  it('icons include a 512×512 entry', () => {
    const icons = manifest.icons as Array<{ sizes: string; src: string; type: string }>
    expect(icons.some((ic) => ic.sizes === '512x512')).toBe(true)
  })

  it('each icon has src, sizes, and type fields', () => {
    const icons = manifest.icons as Array<{ sizes: string; src: string; type: string }>
    for (const icon of icons) {
      expect(typeof icon.src).toBe('string')
      expect(typeof icon.sizes).toBe('string')
      expect(typeof icon.type).toBe('string')
    }
  })
})
