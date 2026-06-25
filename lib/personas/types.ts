// F-484 - Persona-as-Config: the journey backbone types.
//
// Root principle (ARCHITECTURE.md "Journey Backbone"): a Persona (= Target
// Profile) is the only thing that varies. The UX flow is identical for every
// persona; a persona is configuration, not code. New personas (TEF, DELF,
// DALF, Business French, Hobby, AP French) ship as config rows, never as new
// screens or flow.
//
// This is product structure, NOT user state. The config lives in typed modules
// so a later swap to the BE `target_profiles` endpoint is a loader change, not
// a refactor. User state (the chosen persona id + progress) stays in the
// existing lm.* localStorage seam; that is separate (see lib/personas/index.ts
// getActivePersona + lib/journey/progress).

// Global CEFR level enum. Reuses the journey's Level so there is a single
// source of truth (A1..C1) across the backbone.
export type { Level } from '@/lib/journey/journey'
import type { Level } from '@/lib/journey/journey'

// The four exam skills. Co-primary with theme as a projection of the same
// tagged station set (theme view groups by theme, skill view by skill).
export type Skill = 'CO' | 'CE' | 'EO' | 'EE'

// Global method registry ids. Cell-scoped methods sit at a (persona, theme,
// level) coordinate; global methods sit on the rail.
export type MethodId =
  | 'islands'
  | 'audio'
  | 'conversation'
  | 'writing'
  | 'pieges'
  | 'srs'
  | 'mock'
  | 'reading'

export type MethodScope = 'cell' | 'global'

// Lit (live) or not yet authored (bientot). The backbone runs entirely bientot
// and lights up method by method.
export type SlotStatus = 'live' | 'bientot'

export interface MethodStatus {
  id: MethodId
  scope: MethodScope
  status: SlotStatus
}

// A reference to an authored content unit (a tagged station / chunk). Kept as a
// bare id in this scaffold; the BE join key lands in Phase 3.
export type UnitRef = string

// A query over the global tagged pool (cross-cutting derived views). Authored
// themes use `pins` (curated, ordered); query is the optional escape hatch.
export interface Filter {
  skills?: Skill[]
  levels?: Level[]
  tags?: string[]
}

// A persona-local theme. Themes differ per persona (TCF Theme 1 and Business
// Theme 1 are different entities). `pins` is the default ordered membership;
// `query` is an optional derived filter; `excludes` removes pinned units.
export interface Theme {
  id: string
  label: string
  order: number
  pins: UnitRef[]
  query?: Filter
  excludes: UnitRef[]
}

// A grid cell coordinate (persona, theme, level). The Station is the masterable,
// lightable atom: (cell x method). A grid cell is a summary of its stations.
export interface Station {
  cellId: string // `${themeId}-${level}`
  methodId: MethodId
  status: SlotStatus
}

export type PersonaType = 'exam' | 'learning'
export type Terminus = 'mock' | 'capstone'

export type SkillWeights = Record<Skill, number>

export interface Persona {
  id: string
  type: PersonaType
  levelBand: Level[]
  themes: Theme[]
  methods: MethodStatus[]
  skillWeights: SkillWeights
  terminus: Terminus
  diagnosticRef?: string
  // Internal bridge flag (not part of the canonical schema): when true the
  // carte reads real per-(theme,level) state from the journey/progress seam for
  // this persona's themes. Personas without a journey binding (molds, future
  // exams) render every cell bientot. Lets one component render both the real
  // TCF surface and an all-bientot persona with zero code change.
  journeyBound?: boolean
}
