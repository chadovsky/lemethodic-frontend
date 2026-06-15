import { describe, expect, it } from 'vitest'
import { THEMES } from '@/lib/journey/journey'
import {
  SCATTER_LAYOUT,
  SCATTER_KEYS,
  SCATTER_NODE_COUNT,
  toPixels,
  layoutPoints,
  buildSegments,
  pathD,
  pointOnGap,
  pastLast,
} from '@/lib/carte/layout-map'

describe('layout-map — authored scatter positions', () => {
  it('has 8 nodes: grammaire + the 7 themes in journey order', () => {
    expect(SCATTER_NODE_COUNT).toBe(8)
    expect(SCATTER_LAYOUT).toHaveLength(8)
    expect(SCATTER_KEYS).toHaveLength(8)
    expect(SCATTER_KEYS[0]).toBe('grammaire')
    expect(SCATTER_KEYS.slice(1)).toEqual(THEMES.map((t) => t.id))
  })

  it('keeps every authored position inside the 0..100 percent stage box', () => {
    for (const pos of SCATTER_LAYOUT) {
      expect(pos.x).toBeGreaterThanOrEqual(0)
      expect(pos.x).toBeLessThanOrEqual(100)
      expect(pos.y).toBeGreaterThanOrEqual(0)
      expect(pos.y).toBeLessThanOrEqual(100)
    }
  })
})

describe('layout-map — geometry', () => {
  it('toPixels scales a percent position into stage pixel space', () => {
    expect(toPixels({ x: 50, y: 25 }, 1000, 800)).toEqual({ x: 500, y: 200 })
  })

  it('layoutPoints returns one pixel point per node', () => {
    const pts = layoutPoints(1200, 700)
    expect(pts).toHaveLength(8)
    expect(pts[0]).toEqual({ x: (10 / 100) * 1200, y: (42 / 100) * 700 })
  })

  it('buildSegments returns one segment per gap (n-1)', () => {
    const pts = layoutPoints(1200, 700)
    expect(buildSegments(pts)).toHaveLength(7)
  })

  it('pathD threads all gaps into a single bezier string starting at node 0', () => {
    const pts = layoutPoints(1200, 700)
    const segs = buildSegments(pts)
    const d = pathD(pts, segs, 0, pts.length - 1)
    expect(d.startsWith('M ')).toBe(true)
    // one cubic per gap
    expect(d.match(/C /g)).toHaveLength(7)
  })

  it('pathD returns empty for an empty range (no accent before the first node)', () => {
    const pts = layoutPoints(1200, 700)
    const segs = buildSegments(pts)
    expect(pathD(pts, segs, 0, 0)).toBe('')
  })

  it('pointOnGap at t=0 and t=1 hits the gap endpoints', () => {
    const pts = layoutPoints(1200, 700)
    const segs = buildSegments(pts)
    const start = pointOnGap(pts, segs, 2, 0)
    const end = pointOnGap(pts, segs, 2, 1)
    expect(start.x).toBeCloseTo(pts[2].x, 5)
    expect(start.y).toBeCloseTo(pts[2].y, 5)
    expect(end.x).toBeCloseTo(pts[3].x, 5)
    expect(end.y).toBeCloseTo(pts[3].y, 5)
  })

  it('pastLast stays inside the stage with its margin (the overflow guard)', () => {
    const w = 1200
    const h = 700
    const margin = 40
    const p = pastLast(layoutPoints(w, h), 400, w, h, margin)
    expect(p.x).toBeGreaterThanOrEqual(margin)
    expect(p.x).toBeLessThanOrEqual(w - margin)
    expect(p.y).toBeGreaterThanOrEqual(margin)
    expect(p.y).toBeLessThanOrEqual(h - margin)
  })
})
