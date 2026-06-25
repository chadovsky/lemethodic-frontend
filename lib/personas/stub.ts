// F-484 - config-only proof fixture (NOT a shippable, user-selectable persona).
//
// Exists solely to prove the two backbone invariants without a code change:
//   1. The backbone renders cleanly with every slot bientot (zero content).
//   2. A new persona ships as config only.
// The config-only Playwright proof (tests/e2e/f-484.spec.ts) swaps the active
// persona to this one (via the lm.activePersona seam) and asserts the carte grid
// changes shape (different themes x a 2-level band, every cell bientot) with the
// SAME component code. It is never surfaced in any UI, never journeyBound, so it
// has no real states: a true all-bientot backbone.

import type { Level } from '@/lib/journey/journey'
import type { MethodStatus, Persona, Skill, SkillWeights, Theme } from './types'

// A 2-level band (vs TCF's 5) so the proof can assert the column axis is
// config-driven, not hardcoded to five levels.
const STUB_BAND: Level[] = ['A1', 'A2']

// Mold themes: labels are molds ("Theme 1".."Theme 3"), ids are persona-local.
// Distinct from TCF's themes, proving themes are persona-local entities.
const STUB_THEMES: Theme[] = [1, 2, 3].map((n, index) => ({
  id: `stub-theme-${n}`,
  label: `Theme ${n}`,
  order: index,
  pins: [],
  excludes: [],
}))

const STUB_METHODS: MethodStatus[] = [
  { id: 'islands', scope: 'cell', status: 'bientot' },
  { id: 'audio', scope: 'cell', status: 'bientot' },
  { id: 'conversation', scope: 'cell', status: 'bientot' },
  { id: 'writing', scope: 'cell', status: 'bientot' },
  { id: 'pieges', scope: 'cell', status: 'bientot' },
  { id: 'srs', scope: 'global', status: 'bientot' },
  { id: 'mock', scope: 'global', status: 'bientot' },
  { id: 'reading', scope: 'global', status: 'bientot' },
]

const EVEN_WEIGHTS: SkillWeights = (['CO', 'CE', 'EO', 'EE'] as Skill[]).reduce(
  (acc, skill) => ({ ...acc, [skill]: 1 }),
  {} as SkillWeights,
)

export const STUB_PERSONA: Persona = {
  id: 'stub-proof',
  type: 'learning',
  levelBand: STUB_BAND,
  themes: STUB_THEMES,
  methods: STUB_METHODS,
  skillWeights: EVEN_WEIGHTS,
  terminus: 'capstone',
  // No journey binding: every cell renders bientot. This is the all-bientot case.
  journeyBound: false,
}
