import { describe, expect, it } from 'vitest'
import { HOTSPOTS, SCENE_ASPECT } from '@/lib/carte/hotspots'
import { VIEW_W, VIEW_H, screenOrderedPoints, ribbonPath } from '@/lib/carte/path'

describe('carte path — one coral ribbon routed by screen position', () => {
  it('keeps the viewBox aspect equal to the scene aspect (no stroke distortion)', () => {
    expect(VIEW_W).toBe(100)
    expect(VIEW_W / VIEW_H).toBeCloseTo(SCENE_ASPECT, 6)
  })

  it('orders the 8 islands as a serpentine: top L->R, then bottom R->L', () => {
    const pts = screenOrderedPoints()
    expect(pts).toHaveLength(8)
    // x sequence: top row left->right (16,39,63,85) then bottom row right->left
    // (85,63,39,16). This is the winding road, no journey-order diagonal.
    expect(pts.map((p) => p.x)).toEqual([16, 39, 63, 85, 85, 63, 39, 16])
  })

  it('drops straight down the right side between the two rows (no cross-water jump)', () => {
    const pts = screenOrderedPoints()
    // The 4th and 5th points share the right-hand x (culture -> economie): the
    // curve flows down the right edge, never diagonally across the centre.
    expect(pts[3].x).toBe(pts[4].x)
    // Top row sits above the bottom row.
    const topY = Math.max(pts[0].y, pts[1].y, pts[2].y, pts[3].y)
    const bottomY = Math.min(pts[4].y, pts[5].y, pts[6].y, pts[7].y)
    expect(topY).toBeLessThan(bottomY)
  })

  it('never links two islands more than one grid step apart (no long diagonals)', () => {
    const pts = screenOrderedPoints()
    // Largest gap between consecutive points in screen space (y un-scaled back).
    let maxStep = 0
    for (let i = 0; i < pts.length - 1; i++) {
      const dx = pts[i + 1].x - pts[i].x
      const dy = (pts[i + 1].y - pts[i].y) * SCENE_ASPECT
      maxStep = Math.max(maxStep, Math.hypot(dx, dy))
    }
    // One grid step is ~23% (a row hop) or ~37% (the vertical drop); a cross-scene
    // diagonal would be ~70%+. Guard well under that.
    expect(maxStep).toBeLessThan(45)
  })

  it('maps each hotspot into viewBox units (x = percent, y = percent / aspect)', () => {
    const pts = screenOrderedPoints()
    // First point is the top-left island (grammaire).
    expect(pts[0].x).toBe(HOTSPOTS.grammaire.x)
    expect(pts[0].y).toBeCloseTo(HOTSPOTS.grammaire.y / SCENE_ASPECT, 6)
  })

  it('builds one smooth cubic per gap, starting at the first island', () => {
    const d = ribbonPath(screenOrderedPoints())
    expect(d.startsWith('M ')).toBe(true)
    expect(d.match(/C /g)).toHaveLength(7)
    expect(ribbonPath([])).toBe('')
  })
})
