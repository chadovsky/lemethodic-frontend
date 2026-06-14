import { describe, expect, it } from 'vitest'
import {
  ACTIVITY_TYPES,
  getJourney,
  SAMPLE_JOURNEY,
  THEMES,
  type Status,
} from '@/lib/journey/journey'

describe('THEMES', () => {
  it('has 7 themes, education first', () => {
    expect(THEMES).toHaveLength(7)
    expect(THEMES[0].id).toBe('education')
  })

  it('matches the canonical TCF theme order', () => {
    expect(THEMES.map((t) => t.id)).toEqual([
      'education',
      'famille',
      'culture',
      'sante',
      'technologie',
      'environnement',
      'economie',
    ])
  })

  it('gives every theme a non-empty FR label', () => {
    for (const theme of THEMES) {
      expect(theme.label.length).toBeGreaterThan(0)
    }
  })
})

describe('getJourney("B1")', () => {
  const journey = getJourney('B1')

  it('returns the B1 grammar phase (13 clusters)', () => {
    expect(journey.level).toBe('B1')
    expect(journey.grammarPhase).toHaveLength(13)
    expect(journey.grammarPhase.every((g) => g.level === 'B1')).toBe(true)
  })

  it('flags anglophone-interference grammar points', () => {
    const interfering = journey.grammarPhase.filter((g) => g.interference)
    expect(interfering.length).toBeGreaterThan(0)
    expect(journey.grammarPhase.find((g) => g.id === 'imparfait-vs-passe-compose')?.interference).toBe(true)
  })

  it('returns 7 iles, education first', () => {
    expect(journey.iles).toHaveLength(7)
    expect(journey.iles[0].theme).toBe('education')
  })

  it('gives the first ile status current and the rest locked', () => {
    expect(journey.iles[0].status).toBe('current')
    for (const ile of journey.iles.slice(1)) {
      expect(ile.status).toBe('locked')
    }
  })

  it('builds the full 3-beat skeleton on every ile', () => {
    for (const ile of journey.iles) {
      expect(ile.learn).toBeDefined()
      expect(ile.practice.length).toBe(ACTIVITY_TYPES.length)
      expect(ile.check.miniMock).toBeDefined()
    }
  })

  it('seeds learn vocab + grammar points referencing the grammar phase', () => {
    const grammarIds = new Set(journey.grammarPhase.map((g) => g.id))
    for (const ile of journey.iles) {
      expect(ile.learn.vocab.length).toBeGreaterThan(0)
      expect(ile.learn.grammarPoints.length).toBeGreaterThan(0)
      expect(ile.learn.grammarPoints.every((id) => grammarIds.has(id))).toBe(true)
      expect(ile.learn.leMaitreVideoId).toBeNull()
    }
  })

  it('renders every practice activity as a bientot placeholder, one per type', () => {
    for (const ile of journey.iles) {
      expect(ile.practice.map((a) => a.type)).toEqual(ACTIVITY_TYPES)
      expect(ile.practice.every((a) => a.status === 'bientot')).toBe(true)
    }
  })

  it('leaves the mini mocks and final mock bientot', () => {
    expect(journey.finalMock.status).toBe('bientot')
    for (const ile of journey.iles) {
      expect(ile.check.miniMock.status).toBe('bientot')
    }
  })
})

describe('getJourney (other levels)', () => {
  it('returns an empty grammar phase + 7 bientot iles for an unauthored level', () => {
    const journey = getJourney('A2')
    expect(journey.grammarPhase).toEqual([])
    expect(journey.iles).toHaveLength(7)
    const statuses: Status[] = journey.iles.map((ile) => ile.status)
    expect(statuses.every((s) => s === 'bientot')).toBe(true)
  })
})

describe('SAMPLE_JOURNEY', () => {
  it('is the assembled B1 journey', () => {
    expect(SAMPLE_JOURNEY.level).toBe('B1')
    expect(SAMPLE_JOURNEY.iles).toHaveLength(7)
  })
})
