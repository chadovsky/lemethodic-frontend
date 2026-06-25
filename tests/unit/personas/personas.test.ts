import { describe, expect, it, beforeEach } from 'vitest'
import {
  getActivePersona,
  personaFromId,
  stationsFor,
  cellStatusFor,
  recommendNext,
  readiness,
  methodStatus,
  ACTIVE_PERSONA_KEY,
  TCF_PERSONA,
} from '@/lib/personas'
import { STUB_PERSONA } from '@/lib/personas/stub'

// F-484 - the persona backbone seam. These lock the two invariants: the
// backbone runs all-bientot (stub persona) and a new persona is config only.

beforeEach(() => {
  localStorage.clear()
})

describe('persona registry + active selection', () => {
  it('defaults to TCF when no active persona is stored', () => {
    expect(getActivePersona().id).toBe('tcf')
  })

  it('resolves a stored active id, falling back to TCF on an unknown id', () => {
    expect(personaFromId('stub-proof').id).toBe('stub-proof')
    expect(personaFromId('nope').id).toBe('tcf')
    expect(personaFromId(null).id).toBe('tcf')
  })

  it('reads the active persona from localStorage (selection is user state)', () => {
    localStorage.setItem(ACTIVE_PERSONA_KEY, 'stub-proof')
    expect(getActivePersona().id).toBe('stub-proof')
  })
})

describe('TCF persona shape (the real, journey-bound exam)', () => {
  it('is a 7-theme x 5-level exam persona with real theme ids', () => {
    expect(TCF_PERSONA.type).toBe('exam')
    expect(TCF_PERSONA.levelBand).toEqual(['A1', 'A2', 'B1', 'B2', 'C1'])
    expect(TCF_PERSONA.themes).toHaveLength(7)
    expect(TCF_PERSONA.themes[0].id).toBe('education')
    expect(TCF_PERSONA.journeyBound).toBe(true)
  })

  it('ships every method bientot in this scaffold', () => {
    for (const m of TCF_PERSONA.methods) expect(m.status).toBe('bientot')
    expect(methodStatus(TCF_PERSONA, 'srs')).toBe('bientot')
  })
})

describe('stationsFor (cell-scoped stations only)', () => {
  it('generates theme x level x cell-method stations, all bientot', () => {
    const cellMethods = TCF_PERSONA.methods.filter((m) => m.scope === 'cell').length
    const stations = stationsFor(TCF_PERSONA)
    expect(stations).toHaveLength(7 * 5 * cellMethods)
    expect(stations.every((s) => s.status === 'bientot')).toBe(true)
  })
})

describe('cellStatusFor (journey/progress bridge, no-gates)', () => {
  it('returns the real journey state only on the resolved-level column for TCF', () => {
    // B1 resolved, no completions: education is current, on B1 only.
    expect(cellStatusFor(TCF_PERSONA, 'education', 'B1', 'B1', [])).toBe('current')
    // Off-level columns are bientot, never a real state.
    expect(cellStatusFor(TCF_PERSONA, 'education', 'A1', 'B1', [])).toBe('bientot')
  })

  it('maps the model "locked" to bientot (no gate on the carte)', () => {
    // famille is locked behind education in the model; the carte shows bientot.
    expect(cellStatusFor(TCF_PERSONA, 'famille', 'B1', 'B1', [])).toBe('bientot')
  })

  it('advances with progress: a completed theme reads completed, the next current', () => {
    expect(cellStatusFor(TCF_PERSONA, 'education', 'B1', 'B1', ['education'])).toBe('completed')
    expect(cellStatusFor(TCF_PERSONA, 'famille', 'B1', 'B1', ['education'])).toBe('current')
  })

  it('renders EVERY cell bientot for a non-journey (mold) persona', () => {
    // Invariant 1: the backbone runs all-bientot. The stub has no journey.
    for (const theme of STUB_PERSONA.themes) {
      for (const lvl of STUB_PERSONA.levelBand) {
        expect(cellStatusFor(STUB_PERSONA, theme.id, lvl, lvl, [])).toBe('bientot')
      }
    }
  })
})

describe('orchestrator + readiness stubs (Le Cap / readiness)', () => {
  it('Le Cap recommends nothing while everything is bientot', () => {
    expect(recommendNext(TCF_PERSONA)).toBeNull()
  })

  it('readiness is 0 until mastery wiring lands, never a gate', () => {
    expect(readiness(TCF_PERSONA)).toBe(0)
  })
})

describe('stub persona is the config-only proof fixture', () => {
  it('is a different shape (3 mold themes x a 2-level band, learning, no journey)', () => {
    expect(STUB_PERSONA.themes).toHaveLength(3)
    expect(STUB_PERSONA.themes[0].label).toBe('Theme 1')
    expect(STUB_PERSONA.levelBand).toEqual(['A1', 'A2'])
    expect(STUB_PERSONA.type).toBe('learning')
    expect(STUB_PERSONA.journeyBound).toBe(false)
  })
})
