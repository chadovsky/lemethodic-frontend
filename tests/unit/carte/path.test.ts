import { describe, expect, it } from 'vitest'
import { THEMES } from '@/lib/journey/journey'
import { HOTSPOTS, SCENE_ASPECT } from '@/lib/carte/hotspots'
import { JOURNEY_ORDER, VIEW_W, VIEW_H, orderedPoints, ribbonPath } from '@/lib/carte/path'

describe('carte path — coral ribbon through the hotspots', () => {
  it('threads the grammar foundation first, then the 7 themes in order', () => {
    expect(JOURNEY_ORDER).toHaveLength(8)
    expect(JOURNEY_ORDER[0]).toBe('grammaire')
    expect(JOURNEY_ORDER.slice(1)).toEqual(THEMES.map((t) => t.id))
  })

  it('keeps the viewBox aspect equal to the scene aspect (no stroke distortion)', () => {
    expect(VIEW_W).toBe(100)
    expect(VIEW_W / VIEW_H).toBeCloseTo(SCENE_ASPECT, 6)
  })

  it('maps each hotspot into viewBox units (x = percent, y = percent / aspect)', () => {
    const pts = orderedPoints()
    expect(pts).toHaveLength(8)
    expect(pts[0].x).toBe(HOTSPOTS.grammaire.x)
    expect(pts[0].y).toBeCloseTo(HOTSPOTS.grammaire.y / SCENE_ASPECT, 6)
  })

  it('builds one cubic per gap, starting at the first node', () => {
    const pts = orderedPoints()
    const d = ribbonPath(pts)
    expect(d.startsWith('M ')).toBe(true)
    expect(d.match(/C /g)).toHaveLength(7)
  })

  it('returns a shorter solid prefix and empty for an empty range', () => {
    const pts = orderedPoints()
    expect(ribbonPath(pts, 0, 0)).toBe('')
    expect(ribbonPath(pts, 0, 2).match(/C /g)).toHaveLength(2)
  })
})
