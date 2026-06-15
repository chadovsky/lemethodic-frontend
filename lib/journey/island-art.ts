// F-461 — Island art map.
//
// The single source mapping each carte node to its illustration in public/iles/
// (each a 1024 square transparent PNG, base anchored low, landmark rising
// above, no baked shadow). Keyed by IslandKey = the 7 TCF ThemeIds + the
// grammar foundation island. The `Record<IslandKey, string>` type forces every
// key to resolve, so IslandNode (which indexes by ThemeId, a subset of
// IslandKey) can never fall through to an undefined asset — checked at compile
// time, no runtime fallback needed.

import type { ThemeId } from './journey'

// All island art keys: the 7 themes + the grammar foundation island. 'grammaire'
// is not a ThemeId (the grammar node lives outside the ile loop), so it is added
// here explicitly.
export type IslandKey = ThemeId | 'grammaire'

export const ISLAND_ART: Record<IslandKey, string> = {
  education: '/iles/island-education.png',
  famille: '/iles/island-famille.png',
  culture: '/iles/island-culture.png',
  sante: '/iles/island-sante.png',
  technologie: '/iles/island-technologie.png',
  environnement: '/iles/island-environnement.png',
  economie: '/iles/island-economie.png',
  grammaire: '/iles/island-grammaire.png',
}
