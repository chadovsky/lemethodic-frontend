// F-470 — La Carte: hotspot map for the baked Nano Banana scene (desktop).
//
// The desktop /carte is now ONE baked image (public/iles/carte-scene-light.png:
// ocean + 8 islands + coral chain path, no app chrome). The component renders no
// visuals of its own; it overlays interactivity + real journey state on top of
// the image. These are the centres of each island landmass, read off the baked
// render and stored as PERCENT of the image box (0..100) so the overlays track on
// any resize. Keyed by IslandKey (grammaire + the 7 themes) in journey order.
//
// Tune these against the asset in the F-470 visual gate (a temporary debug box
// overlays each zone — set localStorage 'lm.carteDebug' = '1'). Geometry is
// percent-of-image, so re-rendering the scene at a new size needs no change here
// unless the islands actually move.

import type { IslandKey } from '@/lib/journey/island-art'

// A hotspot centre: percent of the scene image width/height (0..100).
export interface Hotspot {
  x: number
  y: number
}

// 4x2 grid of islands in the baked scene, read off carte-scene-light.png. Top row
// (grammaire, education, famille, culture) then bottom row (sante, technologie,
// environnement, economie), left to right. Centred on each island's landmass.
export const HOTSPOTS: Record<IslandKey, Hotspot> = {
  grammaire: { x: 16, y: 33 }, // top-left
  education: { x: 39, y: 33 }, // top, 2nd
  famille: { x: 63, y: 33 }, // top, 3rd
  culture: { x: 85, y: 33 }, // top-right
  sante: { x: 16, y: 70 }, // bottom-left
  technologie: { x: 39, y: 70 }, // bottom, 2nd
  environnement: { x: 63, y: 70 }, // bottom, 3rd
  economie: { x: 85, y: 70 }, // bottom-right
}

// The baked scene. Light only for now; the dark variant is a follow-up asset, so
// dark mode reuses this image until carte-scene-dark.png lands.
export const SCENE_SRC = '/iles/carte-scene-light.png'

// Native aspect ratio of the baked scene (width / height). Drives the fixed-ratio
// box so the image never distorts. Update if the asset is re-rendered at a new
// size (current render: 2496 x 1427).
export const SCENE_ASPECT = 2496 / 1427
