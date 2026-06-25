// F-484 - persona registry + the seams the carte reads.
//
// getActivePersona() is the single source the carte renders from. The persona
// DEFINITIONS are typed config (this module); only the SELECTION (which persona
// is active) is user state, read from localStorage. That split is deliberate:
// swapping to the BE target_profiles endpoint later is a loader change here, not
// a refactor of every consumer.

import {
  getJourney,
  type Level,
  type ThemeId,
} from '@/lib/journey/journey'
import { isThemeId } from '@/lib/journey/progress'
import type { MethodId, Persona, SlotStatus, Station } from './types'
import { TCF_PERSONA } from './tcf'
import { STUB_PERSONA } from './stub'

export * from './types'
export { TCF_PERSONA } from './tcf'

// Active-persona selection key (user state). The persona config itself is NOT
// stored here; only which registered persona is active.
export const ACTIVE_PERSONA_KEY = 'lm.activePersona.v1'

// Registry: id -> Persona. Adding a persona is adding a config row here, never
// a new screen or flow (backbone invariant 2). STUB_PERSONA is a proof fixture
// (never surfaced in UI), present so the config-only Playwright proof can swap
// the active persona at runtime with zero component change.
export const PERSONA_REGISTRY: Record<string, Persona> = {
  [TCF_PERSONA.id]: TCF_PERSONA,
  [STUB_PERSONA.id]: STUB_PERSONA,
}

export const DEFAULT_PERSONA_ID = TCF_PERSONA.id

// Pure resolver (DOM-free, unit-testable): map a stored active-id to a persona,
// falling back to TCF for an unknown/absent id.
export function personaFromId(id: string | null): Persona {
  if (id && PERSONA_REGISTRY[id]) return PERSONA_REGISTRY[id]
  return PERSONA_REGISTRY[DEFAULT_PERSONA_ID]
}

// The active persona the carte renders from. SSR-safe: returns TCF when window
// is absent so the server render matches the default client render.
export function getActivePersona(): Persona {
  if (typeof window === 'undefined') return PERSONA_REGISTRY[DEFAULT_PERSONA_ID]
  return personaFromId(window.localStorage.getItem(ACTIVE_PERSONA_KEY))
}

// Station-set generator: one Station per (theme x level x cell-scoped method).
// Global methods (srs/mock/reading) live on the rail, not in cells. Every
// station is bientot in this scaffold.
export function stationsFor(persona: Persona): Station[] {
  const cellMethods = persona.methods.filter((m) => m.scope === 'cell')
  const stations: Station[] = []
  for (const theme of persona.themes) {
    for (const level of persona.levelBand) {
      for (const method of cellMethods) {
        stations.push({
          cellId: `${theme.id}-${level}`,
          methodId: method.id,
          status: 'bientot',
        })
      }
    }
  }
  return stations
}

// Presentation status for one grid cell (theme x level). The journey/progress
// seam is the source of truth for journeyBound personas; everything else is
// bientot. The learner's real states live on their RESOLVED level column only
// (the journey is computed for the learner's level); off-level columns and
// non-journey personas are bientot. Per the no-gates doctrine the carte never
// renders a "locked" state: the journey model still uses 'locked' to drive
// SEANCE walkability, but here it maps to 'bientot' (not built, not a gate).
// Pure: the resolved level + completions are passed in.
export type CellStatus = 'completed' | 'current' | 'bientot'

export function cellStatusFor(
  persona: Persona,
  themeId: string,
  level: Level,
  resolvedLevel: Level,
  completed: ThemeId[],
): CellStatus {
  if (!persona.journeyBound || !isThemeId(themeId)) return 'bientot'
  if (level !== resolvedLevel) return 'bientot'
  const ile = getJourney(resolvedLevel, completed).iles.find((i) => i.theme === themeId)
  if (!ile) return 'bientot'
  if (ile.status === 'completed') return 'completed'
  if (ile.status === 'current') return 'current'
  // 'locked' and the model's own 'bientot' both present as bientot on the carte.
  return 'bientot'
}

// Le Cap orchestrator stub (Step 5). Recommends one session plan over the LIVE
// surface only. Everything is bientot in this scaffold, so it returns null and
// Le Cap renders its empty/coming-soon state. Priority order is documented in
// ARCHITECTURE.md "Le Cap"; the live implementation lands with content.
export interface SessionPlan {
  review: Station | null
  next: Station | null
  stretch: Station | null
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function recommendNext(persona: Persona, progress?: unknown): SessionPlan | null {
  return null
}

// Readiness signal stub (Step 5): a climbing percentage of mastery against the
// persona's level-band targets. Always visible, never a gate. Returns 0 until
// mastery wiring lands.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function readiness(persona: Persona): number {
  return 0
}

// Convenience: is a method live for this persona (rail / cell rendering).
export function methodStatus(persona: Persona, id: MethodId): SlotStatus {
  return persona.methods.find((m) => m.id === id)?.status ?? 'bientot'
}
