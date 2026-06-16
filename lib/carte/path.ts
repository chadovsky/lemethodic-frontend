// F-470 — La Carte: coral ribbon path through the 8 islands (desktop).
//
// The baked scene (carte-scene-light.png) is ocean + islands only — NO path. The
// coral chain is drawn as ONE smooth SVG curve routed by SCREEN POSITION, not
// journey order: across the TOP row left-to-right, down the right side, then back
// across the BOTTOM row right-to-left — a single continuous winding road touching
// all 8 islands with no straight diagonal cutting across open water. Uniform
// coral (no per-segment colouring).
//
// The SVG uses a viewBox of VIEW_W x VIEW_H where VIEW_W = 100 (x is already a
// percent of width) and VIEW_H = 100 / SCENE_ASPECT (so y percent maps in with the
// SAME unit scale on both axes). Because the scene box's aspect-ratio equals the
// viewBox aspect, preserveAspectRatio="none" fills the box exactly with zero
// stroke distortion (scaleX === scaleY). Pure + unit-tested; CarteWorld just draws
// the single `d` string.

import type { IslandKey } from '@/lib/journey/island-art'
import { HOTSPOTS, SCENE_ASPECT } from './hotspots'

// SVG viewBox dimensions (see header). VIEW_H keeps the y axis at the same unit
// scale as x so the ribbon never distorts.
export const VIEW_W = 100
export const VIEW_H = 100 / SCENE_ASPECT

export interface UPt {
  x: number
  y: number
}

// The 8 hotspots ordered as a SCREEN-POSITION serpentine and mapped into viewBox
// units. Top row (the islands above the vertical midpoint) left-to-right, then the
// bottom row right-to-left, so the curve flows: across the top, down the right
// side, back across the bottom. x = percent (0..100); y = percent / aspect (so a
// square in screen space stays square in viewBox). Derived from the coords (not a
// hardcoded sequence) so it survives hotspot tuning as long as the layout stays a
// top/bottom grid.
export function screenOrderedPoints(): UPt[] {
  const pts = (Object.keys(HOTSPOTS) as IslandKey[]).map((k) => ({
    x: HOTSPOTS[k].x,
    y: HOTSPOTS[k].y,
  }))
  const ys = pts.map((p) => p.y)
  const midY = (Math.min(...ys) + Math.max(...ys)) / 2
  const top = pts.filter((p) => p.y < midY).sort((a, b) => a.x - b.x) // left -> right
  const bottom = pts.filter((p) => p.y >= midY).sort((a, b) => b.x - a.x) // right -> left
  return [...top, ...bottom].map((p) => ({ x: p.x, y: p.y / SCENE_ASPECT }))
}

function r(n: number): number {
  return Math.round(n * 100) / 100
}

// Catmull-Rom -> cubic-bezier path string through every point in order, with
// matched tangents for a smooth, rounded curve. The endpoints duplicate their
// neighbour so the curve starts/ends cleanly (no overshoot into open water).
export function ribbonPath(pts: UPt[]): string {
  if (pts.length === 0) return ''
  let d = `M ${r(pts[0].x)} ${r(pts[0].y)}`
  for (let i = 0; i < pts.length - 1; i++) {
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
