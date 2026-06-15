// F-469 — La Carte sea-world scatter layout map + geometry.
//
// Authored fixed positions for the 8 island nodes of the desktop scatter,
// approximating the winning Nano Banana scatter mock (light). Positions are
// percentages of the sea stage (x = % of width, y = % of height), in journey
// order: node 0 = la grammaire (the foundation island), nodes 1..7 = the 7 TCF
// themes in THEME order. The coral path threads them in this order; tune the
// coords against the mock without touching the geometry helpers or the DOM
// contract the CarteWorld renders from them.
//
// The geometry below is the same Catmull-Rom -> cubic-bezier construction the
// mobile serpentine (CarteMap) lays its trail with, lifted here as pure,
// unit-testable functions so the world consumes them instead of re-deriving.

import type { IslandKey } from '@/lib/journey/island-art'
import { THEMES } from '@/lib/journey/journey'

// A point in stage pixel space.
export interface Pt {
  x: number
  y: number
}

// A normalised authored position (percent of stage width/height, 0..100).
export interface NodePos {
  x: number
  y: number
}

// 8 authored coords, indexed in journey order (0 = grammaire, 1..7 = themes in
// THEME order). Organic island scatter approximating the Nano Banana mocks: the
// nodes fill the sea like a real archipelago rather than a single wave, and the
// coral trail threads them as one voyage. Tunable against the mock (Chadi nudges
// live); geometry is index-driven so any reshuffle here just re-threads the path.
export const SCATTER_LAYOUT: NodePos[] = [
  { x: 10, y: 42 }, // 0 — la grammaire
  { x: 34, y: 28 }, // 1 — l'éducation
  { x: 22, y: 70 }, // 2 — la famille
  { x: 45, y: 55 }, // 3 — la culture
  { x: 78, y: 30 }, // 4 — la santé
  { x: 62, y: 50 }, // 5 — la technologie
  { x: 58, y: 74 }, // 6 — l'environnement
  { x: 86, y: 72 }, // 7 — l'économie
]

// Island keys aligned to SCATTER_LAYOUT indices: grammaire first, then the 7
// themes in THEME order. Length is asserted equal to SCATTER_LAYOUT in tests.
export const SCATTER_KEYS: IslandKey[] = [
  'grammaire',
  ...THEMES.map((theme) => theme.id),
]

export const SCATTER_NODE_COUNT = SCATTER_LAYOUT.length // 8

// Convert an authored percent position into stage pixel space.
export function toPixels(pos: NodePos, width: number, height: number): Pt {
  return { x: (pos.x / 100) * width, y: (pos.y / 100) * height }
}

// All authored points in pixel space for a given stage size.
export function layoutPoints(width: number, height: number): Pt[] {
  return SCATTER_LAYOUT.map((pos) => toPixels(pos, width, height))
}

export interface Seg {
  c1: Pt
  c2: Pt
  p: Pt
}

// Catmull-Rom -> cubic bezier control points, one segment per gap. Smooth curve
// through every node centre with matched tangents (so the accent prefix and the
// muted full path share the same shape).
export function buildSegments(pts: Pt[]): Seg[] {
  const segs: Seg[] = []
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    segs.push({
      c1: { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 },
      c2: { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 },
      p: p2,
    })
  }
  return segs
}

function round(n: number): number {
  return Math.round(n * 10) / 10
}

// SVG path string for the gaps [from, to). Empty when the range is empty.
export function pathD(pts: Pt[], segs: Seg[], from: number, to: number): string {
  if (to <= from || pts.length === 0) return ''
  let d = `M ${round(pts[from].x)} ${round(pts[from].y)}`
  for (let i = from; i < to; i++) {
    const s = segs[i]
    d += ` C ${round(s.c1.x)} ${round(s.c1.y)} ${round(s.c2.x)} ${round(s.c2.y)} ${round(s.p.x)} ${round(s.p.y)}`
  }
  return d
}

// Point on the cubic for gap g at parameter t (buoys sit along a segment).
export function pointOnGap(pts: Pt[], segs: Seg[], g: number, t: number): Pt {
  const p0 = pts[g]
  const { c1, c2, p: p3 } = segs[g]
  const mt = 1 - t
  return {
    x: mt * mt * mt * p0.x + 3 * mt * mt * t * c1.x + 3 * mt * t * t * c2.x + t * t * t * p3.x,
    y: mt * mt * mt * p0.y + 3 * mt * mt * t * c1.y + 3 * mt * t * t * c2.y + t * t * t * p3.y,
  }
}

// Extrapolate past the final node along the last segment's exit direction, so
// the final-mock buoy floats on the trail's continuation. Clamped inside the
// stage with a margin so it can never overflow the sea (the 1920 guard).
export function pastLast(pts: Pt[], distance: number, width: number, height: number, margin = 40): Pt {
  const n = pts.length
  const last = pts[n - 1]
  const prev = pts[n - 2] ?? last
  const dx = last.x - prev.x
  const dy = last.y - prev.y
  const len = Math.hypot(dx, dy) || 1
  const raw = { x: last.x + (dx / len) * distance, y: last.y + (dy / len) * distance }
  return {
    x: Math.max(margin, Math.min(width - margin, raw.x)),
    y: Math.max(margin, Math.min(height - margin, raw.y)),
  }
}
