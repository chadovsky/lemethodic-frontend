// F-484 - TCF persona seed (config row, not code).
//
// TCF is the first exam lit. Per the F-484 amendment its themes are the REAL
// journey themes (education..economie) with real FR labels and theme-keyed
// routes, so the carte renders TCF's real per-(theme,level) state from the
// journey/progress seam (journeyBound). The all-bientot invariant is proven by
// a separate mold persona (lib/personas/stub.ts), not by blanking TCF.
//
// Every method ships bientot in this scaffold: the backbone runs content-free
// and lights up method by method. islands/audio/conversation/writing/pieges are
// cell-scoped (sit at a theme x level cell); srs/mock/reading are global (rail).

import { THEMES, type Level } from '@/lib/journey/journey'
import type { MethodStatus, Persona, Skill, SkillWeights, Theme } from './types'

const LEVEL_BAND: Level[] = ['A1', 'A2', 'B1', 'B2', 'C1']

// Real journey themes -> persona themes (order is the canonical carte order,
// education first). No content yet: pins/excludes are empty molds.
const TCF_THEMES: Theme[] = THEMES.map((theme, index) => ({
  id: theme.id,
  label: theme.label,
  order: index,
  pins: [],
  excludes: [],
}))

// Full method registry, every slot bientot.
const TCF_METHODS: MethodStatus[] = [
  { id: 'islands', scope: 'cell', status: 'bientot' },
  { id: 'audio', scope: 'cell', status: 'bientot' },
  { id: 'conversation', scope: 'cell', status: 'bientot' },
  { id: 'writing', scope: 'cell', status: 'bientot' },
  { id: 'pieges', scope: 'cell', status: 'bientot' },
  { id: 'srs', scope: 'global', status: 'bientot' },
  { id: 'mock', scope: 'global', status: 'bientot' },
  { id: 'reading', scope: 'global', status: 'bientot' },
]

// Even weighting until the diagnostic feeds real per-skill targets.
const EVEN_WEIGHTS: SkillWeights = (['CO', 'CE', 'EO', 'EE'] as Skill[]).reduce(
  (acc, skill) => ({ ...acc, [skill]: 1 }),
  {} as SkillWeights,
)

export const TCF_PERSONA: Persona = {
  id: 'tcf',
  type: 'exam',
  levelBand: LEVEL_BAND,
  themes: TCF_THEMES,
  methods: TCF_METHODS,
  skillWeights: EVEN_WEIGHTS,
  terminus: 'mock',
  diagnosticRef: 'tcf-diagnostic',
  journeyBound: true,
}
