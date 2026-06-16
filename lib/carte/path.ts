// F-470 — La Carte: coral ribbon path through the 8 island hotspots (desktop).
//
// The baked scene (carte-scene-light.png) is ocean + islands only — NO path. The
// coral chain is drawn as an SVG overlay threading the 8 hotspots in journey
// order (grammaire -> the 7 themes), so it always tracks whatever the hotspots
// are tuned to. Completed segments render solid; upcoming segments render muted.
//
// The SVG uses a viewBox of VIEW_W x VIEW_H where VIEW_W = 100 (x is already a
// percent of width) and VIEW_H = 100 / SCENE_ASPECT (so y percent maps in with the
// SAME unit scale on both axes). Because the scene box's aspect-ratio equals the
// viewBox aspect, preserveAspectRatio="none" fills the box exactly with zero
// stroke distortion (scaleX === scaleY). Pure + unit-tested; CarteWorld just draws
// the two `d` strings.

import { THEMES } from '@/lib/journey/journey'
import type { IslandKey } from '@/lib/journey/island-art'
import { HOTSPOTS, SCENE_ASPECT } from './hotspots'

// Journey order: the grammar foundation first, then the 7 themes in THEME order.
export const JOURNEY_ORDER: IslandKey[] = ['grammaire', ...THEMES.map((t) => t.id)]

// SVG viewBox dimensions (see header). VIEW_H keeps the y axis at the same unit
// scale as x so the ribbon never distorts.
export const VIEW_W = 100
export const VIEW_H = 100 / SCENE_ASPECT

export interface UPt {
  x: number
  y: number
}

// The 8 hotspot centres in viewBox units, in journey order. x = percent (0..100),
// y = percent / aspect (so a square in screen space stays square in viewBox).
export function orderedPoints(): UPt[] {
  return JOURNEY_ORDER.map((key) => ({
    x: HOTSPOTS[key].x,
    y: HOTSPOTS[key].y / SCENE_ASPECT,
  }))
}

function r(n: number): number {
  return Math.round(n * 100) / 100
}

// Catmull-Rom -> cubic-bezier path string for the gaps [from, to). A smooth curve
// through every hotspot centre with matched tangents, so the solid prefix and the
// muted full path share the exact same shape. Empty for an empty range.
export function ribbonPath(pts: UPt[], from = 0, to = pts.length - 1): string {
  if (to <= from || pts.length === 0) return ''
  let d = `M ${r(pts[from].x)} ${r(pts[from].y)}`
  for (let i = from; i < to; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 }
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 }
    d += ` C ${r(c1.x)} ${r(c1.y)} ${r(c2.x)} ${r(c2.y)} ${r(p2.x)} ${r(p2.y)}`
  }
  return d
}
