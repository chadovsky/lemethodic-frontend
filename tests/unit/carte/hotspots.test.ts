import { describe, expect, it } from 'vitest'
import { THEMES } from '@/lib/journey/journey'
import { HOTSPOTS, SCENE_SRC, SCENE_ASPECT } from '@/lib/carte/hotspots'

describe('carte hotspots — baked scene overlay map', () => {
  it('has a hotspot for the grammar foundation + each of the 7 themes', () => {
    const keys = Object.keys(HOTSPOTS)
    expect(keys).toHaveLength(8)
    expect(keys).toContain('grammaire')
    for (const theme of THEMES) {
      expect(keys).toContain(theme.id)
    }
  })

  it('keeps every hotspot inside the 0..100 percent image box', () => {
    for (const { x, y } of Object.values(HOTSPOTS)) {
      expect(x).toBeGreaterThanOrEqual(0)
      expect(x).toBeLessThanOrEqual(100)
      expect(y).toBeGreaterThanOrEqual(0)
      expect(y).toBeLessThanOrEqual(100)
    }
  })

  it('points at the baked light scene with a landscape aspect ratio', () => {
    expect(SCENE_SRC).toBe('/iles/carte-scene-light.png')
    expect(SCENE_ASPECT).toBeGreaterThan(1)
  })
})
